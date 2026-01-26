import logging
import time
from datetime import datetime
from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.management import call_command
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution
from django_apscheduler import util

logger = logging.getLogger(__name__)


def run_daily_sync():
    """
    毎日の同期処理を順番に実行
    1. Topps NOWカード情報のスクレイピング
    2. 商品URL生成・修正
    3. 発行日スクレイピング
    4. MLB Game ID紐付け
    5. 選手情報同期（MLB Player ID、成績、国籍）
    6. WBCデータ同期
    """
    start_time = datetime.now()
    logger.info(f"=== Daily sync started at {start_time} ===")

    steps = [
        # Step 1: Topps NOWカード情報のスクレイピング
        {
            'name': 'Topps NOW scraping',
            'command': 'toppsNow_archive',
            'kwargs': {'max_cards': 50, 'delay': 3.0, 'headless': True},
        },
        # Step 2: 商品URL生成
        {
            'name': 'Generate product URLs',
            'command': 'generate_product_urls',
            'kwargs': {},
        },
        # Step 3: 404 URLを修正
        {
            'name': 'Fix broken URLs',
            'command': 'fix_broken_urls',
            'kwargs': {},
        },
        # Step 4: 発行日をスクレイピング
        {
            'name': 'Scrape release dates',
            'command': 'scrape_release_dates',
            'kwargs': {'limit': 100, 'delay': 5},
        },
        # Step 5: カードの発行日からMLB Game IDを紐付け
        {
            'name': 'Fetch game IDs',
            'command': 'fetch_game_ids',
            'kwargs': {'limit': 0},
        },
        # Step 6: 選手名→MLB Player ID紐付け
        {
            'name': 'Sync MLB players',
            'command': 'sync_mlb_players',
            'kwargs': {'limit': 0},
        },
        # Step 7: 選手の打撃・投球成績を取得
        {
            'name': 'Fetch player stats',
            'command': 'fetch_player_stats',
            'kwargs': {'season': datetime.now().year, 'limit': 0},
        },
        # Step 8: 選手の国籍を取得
        {
            'name': 'Fetch player nationality',
            'command': 'fetch_player_nationality',
            'kwargs': {'limit': 0},
        },
        # Step 9: WBCトーナメントデータ取得
        {
            'name': 'Fetch WBC data',
            'command': 'fetch_wbc_data',
            'kwargs': {},
        },
        # Step 10: WBC出場選手の紐付け
        {
            'name': 'Fetch WBC players',
            'command': 'fetch_wbc_players',
            'kwargs': {},
        },
    ]

    results = []
    for i, step in enumerate(steps, 1):
        step_start = datetime.now()
        logger.info(f"[{i}/{len(steps)}] Starting: {step['name']}")

        try:
            call_command(step['command'], **step['kwargs'])
            elapsed = (datetime.now() - step_start).total_seconds()
            logger.info(f"[{i}/{len(steps)}] Completed: {step['name']} ({elapsed:.1f}s)")
            results.append({'step': step['name'], 'status': 'success', 'elapsed': elapsed})
        except Exception as e:
            elapsed = (datetime.now() - step_start).total_seconds()
            logger.error(f"[{i}/{len(steps)}] Failed: {step['name']} - {e}")
            results.append({'step': step['name'], 'status': 'failed', 'error': str(e), 'elapsed': elapsed})
            # 失敗しても次のステップに進む

        # ステップ間で少し待機（APIレート制限対策）
        time.sleep(2)

    # 結果サマリー
    total_elapsed = (datetime.now() - start_time).total_seconds()
    success_count = sum(1 for r in results if r['status'] == 'success')
    failed_count = sum(1 for r in results if r['status'] == 'failed')

    logger.info(f"=== Daily sync completed ===")
    logger.info(f"Total time: {total_elapsed:.1f}s")
    logger.info(f"Results: {success_count} success, {failed_count} failed")

    if failed_count > 0:
        failed_steps = [r['step'] for r in results if r['status'] == 'failed']
        logger.warning(f"Failed steps: {', '.join(failed_steps)}")


@util.close_old_connections
def delete_old_job_executions(max_age=604_800):
    """
    古いジョブ実行履歴を削除（7日以上前のもの）
    """
    DjangoJobExecution.objects.delete_old_job_executions(max_age)


class Command(BaseCommand):
    help = "Run APScheduler for scheduled tasks"

    def add_arguments(self, parser):
        parser.add_argument(
            '--hour',
            type=int,
            default=7,
            help='Hour to run the scraping job (default: 7, meaning 7:00 AM)'
        )
        parser.add_argument(
            '--minute',
            type=int,
            default=0,
            help='Minute to run the scraping job (default: 0)'
        )

    def handle(self, *args, **options):
        scheduler = BlockingScheduler(timezone=settings.TIME_ZONE)
        scheduler.add_jobstore(DjangoJobStore(), "default")

        hour = options['hour']
        minute = options['minute']

        # 毎日の同期ジョブを登録
        # 毎日指定時刻に実行
        scheduler.add_job(
            run_daily_sync,
            trigger=CronTrigger(hour=hour, minute=minute),
            id="run_daily_sync",
            max_instances=1,
            replace_existing=True,
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Added job: run_daily_sync - runs daily at {hour:02d}:{minute:02d}"
            )
        )
        self.stdout.write(
            self.style.NOTICE(
                "  Steps: toppsNow_archive → generate_product_urls → fix_broken_urls → "
                "scrape_release_dates → fetch_game_ids → sync_mlb_players → "
                "fetch_player_stats → fetch_player_nationality → fetch_wbc_data → fetch_wbc_players"
            )
        )

        # 古いジョブ履歴の削除ジョブ（毎週月曜日0:00に実行）
        scheduler.add_job(
            delete_old_job_executions,
            trigger=CronTrigger(day_of_week="mon", hour="00", minute="00"),
            id="delete_old_job_executions",
            max_instances=1,
            replace_existing=True,
        )
        self.stdout.write(
            self.style.SUCCESS(
                "Added job: delete_old_job_executions - runs weekly on Monday at 00:00"
            )
        )

        try:
            self.stdout.write(self.style.SUCCESS("Starting scheduler..."))
            self.stdout.write(
                self.style.NOTICE(
                    f"Press Ctrl+C to exit. Scheduler will run jobs at scheduled times."
                )
            )
            scheduler.start()
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Stopping scheduler..."))
            scheduler.shutdown()
            self.stdout.write(self.style.SUCCESS("Scheduler stopped successfully"))
