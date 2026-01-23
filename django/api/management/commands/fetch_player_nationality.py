"""
MLB Stats APIから選手の国籍（birthCountry）を取得して保存するコマンド
"""
import time
from django.core.management.base import BaseCommand
from api.models import Player

try:
    import statsapi
except ImportError:
    statsapi = None


class Command(BaseCommand):
    help = "MLB Stats APIから選手の国籍（出身国）を取得・保存"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="実際には更新せず、取得した国籍を表示するだけ",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=50,
            help="処理するプレイヤー数（デフォルト: 50、0で全件）",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="既に国籍が設定されているプレイヤーも上書きする",
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

        # mlb_player_idが設定されているプレイヤーを対象
        players = Player.objects.filter(mlb_player_id__isnull=False)

        if not force:
            # 国籍が空のプレイヤーのみ
            players = players.filter(nationality="")

        if limit > 0:
            players = players[:limit]

        total = players.count()
        self.stdout.write(f"処理対象: {total}名のプレイヤー")

        if total == 0:
            self.stdout.write("処理対象のプレイヤーがいません")
            return

        updated = 0
        not_found = 0
        errors = 0

        for i, player in enumerate(players, 1):
            self.stdout.write(f"\n[{i}/{total}] {player.full_name} (MLB ID: {player.mlb_player_id})")

            try:
                # MLB Stats APIで選手詳細を取得
                player_info = statsapi.get("person", {"personId": player.mlb_player_id})

                if not player_info or "people" not in player_info or not player_info["people"]:
                    self.stdout.write(self.style.WARNING("  選手情報が取得できません"))
                    not_found += 1
                    continue

                person = player_info["people"][0]
                birth_country = person.get("birthCountry", "")

                if birth_country:
                    self.stdout.write(self.style.SUCCESS(f"  国籍: {birth_country}"))

                    if dry_run:
                        self.stdout.write(self.style.WARNING("  [DRY RUN] 更新スキップ"))
                    else:
                        player.nationality = birth_country
                        player.save(update_fields=["nationality"])
                        self.stdout.write(self.style.SUCCESS("  保存完了"))

                    updated += 1
                else:
                    self.stdout.write(self.style.WARNING("  国籍情報がありません"))
                    not_found += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  エラー: {e}"))
                errors += 1

            # APIレート制限対策
            if i < total:
                time.sleep(delay)

        self.stdout.write(f"\n処理完了: 更新 {updated}件, 情報なし {not_found}件, エラー {errors}件")
