"""
Topps NOW スクレイピングを即時実行するコマンド

使い方:
  # デフォルト（50件）
  docker compose exec django python manage.py scrape_topps_now

  # 件数指定
  docker compose exec django python manage.py scrape_topps_now --max-cards 100

  # 特定のページから
  docker compose exec django python manage.py scrape_topps_now --url "https://www.topps.com/collections/mlb-topps-now-archive?p=2"
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Immediately scrape Topps NOW archive (wrapper for toppsNow_archive)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--max-cards',
            type=int,
            default=50,
            help='Maximum number of cards to scrape (default: 50)'
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=3.0,
            help='Delay between actions in seconds (default: 3.0)'
        )
        parser.add_argument(
            '--url',
            type=str,
            default=None,
            help='Custom URL to scrape from'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting Topps NOW scraping...'))
        self.stdout.write(f'  Max cards: {options["max_cards"]}')
        self.stdout.write(f'  Delay: {options["delay"]}s')
        if options['url']:
            self.stdout.write(f'  URL: {options["url"]}')

        try:
            # toppsNow_archive コマンドを呼び出し
            kwargs = {
                'max_cards': options['max_cards'],
                'delay': options['delay'],
                'headless': True,
            }
            if options['url']:
                kwargs['url'] = options['url']

            call_command('toppsNow_archive', **kwargs)

            self.stdout.write(self.style.SUCCESS('Scraping completed!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Scraping failed: {e}'))
            raise
