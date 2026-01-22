"""
ToppsカードのリリースI日から試合日を算出し、MLB Stats APIでgame_idを取得して保存するコマンド
"""
import time
from datetime import timedelta
from django.core.management.base import BaseCommand
from api.models import ToppsCard

try:
    import statsapi
except ImportError:
    statsapi = None


class Command(BaseCommand):
    help = "ToppsカードのMLB Game IDを取得して保存"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="実際には保存せず、取得したgame_idを表示するだけ",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=50,
            help="処理するカード数（デフォルト: 50、0で全件）",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="既にmlb_game_idが設定されているカードも上書きする",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=0.3,
            help="APIリクエスト間の待機時間（秒、デフォルト: 0.3）",
        )

    def handle(self, *args, **options):
        if not statsapi:
            self.stdout.write(
                self.style.ERROR("MLB-StatsAPIがインストールされていません。pip install MLB-StatsAPI")
            )
            return

        dry_run = options["dry_run"]
        limit = options["limit"]
        force = options["force"]
        delay = options["delay"]

        # 対象カードを取得（release_dateとteamが設定されているもの）
        cards = ToppsCard.objects.filter(
            release_date__isnull=False,
            team__mlb_team_id__isnull=False
        ).select_related('team', 'player')

        if not force:
            cards = cards.filter(mlb_game_id__isnull=True)

        if limit > 0:
            cards = cards[:limit]

        total = cards.count()
        self.stdout.write(f"処理対象: {total}枚のカード")

        if total == 0:
            self.stdout.write("処理対象のカードがありません")
            return

        updated = 0
        not_found = 0
        errors = 0

        for i, card in enumerate(cards, 1):
            # 試合日は発行日の前日
            game_date = card.release_date - timedelta(days=1)
            game_date_str = game_date.strftime('%m/%d/%Y')

            player_name = card.player.full_name if card.player else "Team Set"
            team_name = card.team.abbreviation if card.team else "-"

            self.stdout.write(f"\n[{i}/{total}] #{card.card_number} {player_name} ({team_name})")
            self.stdout.write(f"  発行日: {card.release_date} → 試合日: {game_date}")

            try:
                games = statsapi.schedule(
                    date=game_date_str,
                    team=card.team.mlb_team_id
                )

                if games:
                    game = games[0]
                    game_id = game['game_id']

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  Game ID: {game_id} ({game['away_name']} @ {game['home_name']}, {game.get('away_score', '-')}-{game.get('home_score', '-')})"
                        )
                    )

                    if dry_run:
                        self.stdout.write(self.style.WARNING("  [DRY RUN] 更新スキップ"))
                    else:
                        card.mlb_game_id = game_id
                        card.save(update_fields=["mlb_game_id"])
                        self.stdout.write(self.style.SUCCESS("  保存完了"))
                    updated += 1
                else:
                    self.stdout.write(self.style.WARNING(f"  試合が見つかりません"))
                    not_found += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  エラー: {e}"))
                errors += 1

            # APIレート制限対策
            if i < total:
                time.sleep(delay)

        self.stdout.write(f"\n処理完了: 成功 {updated}件, 見つからず {not_found}件, エラー {errors}件")
