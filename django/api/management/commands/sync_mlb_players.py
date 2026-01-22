"""
既存のPlayer名からMLB Stats APIで検索し、mlb_player_idを取得・保存するコマンド
"""
import time
from django.core.management.base import BaseCommand
from api.models import Player

try:
    import statsapi
except ImportError:
    statsapi = None


class Command(BaseCommand):
    help = "既存のPlayer名からMLB Stats APIでmlb_player_idを取得・保存"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="実際には更新せず、マッチした選手を表示するだけ",
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
            help="既にmlb_player_idが設定されているプレイヤーも上書きする",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=0.5,
            help="APIリクエスト間の待機時間（秒、デフォルト: 0.5）",
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

        # 対象プレイヤーを取得
        players = Player.objects.filter(is_active=True)

        if not force:
            players = players.filter(mlb_player_id__isnull=True)

        if limit > 0:
            players = players[:limit]

        total = players.count()
        self.stdout.write(f"処理対象: {total}名のプレイヤー")

        if total == 0:
            self.stdout.write("処理対象のプレイヤーがいません")
            return

        matched = 0
        not_found = 0
        multiple_found = 0

        for i, player in enumerate(players, 1):
            self.stdout.write(f"\n[{i}/{total}] {player.full_name}")

            try:
                # MLB Stats APIで選手を検索
                results = statsapi.lookup_player(player.full_name)

                if not results:
                    # 名前の表記揺れ対策: ラストネームだけで検索
                    results = statsapi.lookup_player(player.last_name)
                    if results:
                        # フルネームに近いものをフィルタ
                        results = [
                            r for r in results
                            if player.first_name.lower() in r.get("fullName", "").lower()
                        ]

                if not results:
                    self.stdout.write(self.style.WARNING(f"  見つかりません"))
                    not_found += 1
                    continue

                if len(results) == 1:
                    mlb_player = results[0]
                else:
                    # 複数見つかった場合、アクティブな選手を優先
                    active_players = [r for r in results if r.get("active", False)]
                    if len(active_players) == 1:
                        mlb_player = active_players[0]
                    elif len(active_players) > 1:
                        # チーム名でもフィルタを試行
                        if player.team:
                            team_matches = [
                                r for r in active_players
                                if player.team.full_name.lower() in r.get("currentTeam", {}).get("name", "").lower()
                            ]
                            if len(team_matches) == 1:
                                mlb_player = team_matches[0]
                            else:
                                self.stdout.write(
                                    self.style.WARNING(f"  複数の選手が見つかりました: {len(results)}件")
                                )
                                for r in results[:5]:
                                    self.stdout.write(f"    - {r.get('fullName')} (ID: {r.get('id')}, Team: {r.get('currentTeam', {}).get('name', 'N/A')})")
                                multiple_found += 1
                                continue
                        else:
                            mlb_player = active_players[0]
                    else:
                        # アクティブな選手がいない場合は最初の結果を使用
                        mlb_player = results[0]

                mlb_id = mlb_player.get("id")
                mlb_name = mlb_player.get("fullName")
                mlb_team = mlb_player.get("currentTeam", {}).get("name", "N/A")

                self.stdout.write(
                    self.style.SUCCESS(f"  マッチ: {mlb_name} (ID: {mlb_id}, Team: {mlb_team})")
                )

                if dry_run:
                    self.stdout.write(self.style.WARNING("  [DRY RUN] 更新スキップ"))
                else:
                    # 既に同じIDが他の選手に使われていないか確認
                    existing = Player.objects.filter(mlb_player_id=mlb_id).exclude(pk=player.pk).first()
                    if existing:
                        self.stdout.write(
                            self.style.WARNING(f"  ID {mlb_id} は既に {existing.full_name} に割り当て済み")
                        )
                        continue

                    player.mlb_player_id = mlb_id
                    player.save(update_fields=["mlb_player_id"])
                    self.stdout.write(self.style.SUCCESS("  保存完了"))

                matched += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  エラー: {e}"))
                import traceback
                self.stdout.write(traceback.format_exc())

            # APIレート制限対策
            if i < total:
                time.sleep(delay)

        self.stdout.write(f"\n処理完了: マッチ {matched}件, 見つからず {not_found}件, 複数候補 {multiple_found}件")
