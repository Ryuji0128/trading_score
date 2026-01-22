"""
MLB Stats APIから選手の成績（打撃・投球）を取得して保存するコマンド
"""
import time
from datetime import datetime
from decimal import Decimal, InvalidOperation
from django.core.management.base import BaseCommand
from api.models import Player, PlayerStats, StatType

try:
    import statsapi
except ImportError:
    statsapi = None


class Command(BaseCommand):
    help = "MLB Stats APIから選手の打撃・投球成績を取得して保存"

    def add_arguments(self, parser):
        parser.add_argument(
            "--season",
            type=int,
            default=datetime.now().year,
            help="取得するシーズン年（デフォルト: 現在の年）",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="実際には保存せず、取得した成績を表示するだけ",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=50,
            help="処理するプレイヤー数（デフォルト: 50、0で全件）",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=0.5,
            help="APIリクエスト間の待機時間（秒、デフォルト: 0.5）",
        )
        parser.add_argument(
            "--player-id",
            type=int,
            help="特定のプレイヤーIDのみ処理",
        )

    def handle(self, *args, **options):
        if not statsapi:
            self.stdout.write(
                self.style.ERROR("MLB-StatsAPIがインストールされていません。pip install MLB-StatsAPI")
            )
            return

        season = options["season"]
        dry_run = options["dry_run"]
        limit = options["limit"]
        delay = options["delay"]
        player_id = options.get("player_id")

        self.stdout.write(f"シーズン: {season}")

        # 対象プレイヤーを取得（mlb_player_idが設定されているもの）
        players = Player.objects.filter(
            mlb_player_id__isnull=False,
            is_active=True
        )

        if player_id:
            players = players.filter(pk=player_id)

        if limit > 0 and not player_id:
            players = players[:limit]

        total = players.count()
        self.stdout.write(f"処理対象: {total}名のプレイヤー")

        if total == 0:
            self.stdout.write("処理対象のプレイヤーがいません（mlb_player_idが設定されていない可能性があります）")
            return

        hitting_saved = 0
        pitching_saved = 0
        errors = 0

        for i, player in enumerate(players, 1):
            self.stdout.write(f"\n[{i}/{total}] {player.full_name} (MLB ID: {player.mlb_player_id})")

            try:
                # 打撃成績を取得
                hitting_stats = self.fetch_hitting_stats(player.mlb_player_id, season)
                if hitting_stats:
                    self.stdout.write(self.style.SUCCESS(f"  打撃: AVG {hitting_stats.get('avg', '-')}, HR {hitting_stats.get('homeRuns', '-')}, RBI {hitting_stats.get('rbi', '-')}"))

                    if not dry_run:
                        self.save_stats(player, season, StatType.HITTING, hitting_stats)
                        self.stdout.write("    保存完了")
                    hitting_saved += 1
                else:
                    self.stdout.write("  打撃: データなし")

                # 投球成績を取得
                pitching_stats = self.fetch_pitching_stats(player.mlb_player_id, season)
                if pitching_stats:
                    self.stdout.write(self.style.SUCCESS(f"  投球: W-L {pitching_stats.get('wins', '-')}-{pitching_stats.get('losses', '-')}, ERA {pitching_stats.get('era', '-')}, K {pitching_stats.get('strikeOuts', '-')}"))

                    if not dry_run:
                        self.save_stats(player, season, StatType.PITCHING, pitching_stats)
                        self.stdout.write("    保存完了")
                    pitching_saved += 1
                else:
                    self.stdout.write("  投球: データなし")

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  エラー: {e}"))
                import traceback
                self.stdout.write(traceback.format_exc())
                errors += 1

            # APIレート制限対策
            if i < total:
                time.sleep(delay)

        self.stdout.write(f"\n処理完了: 打撃 {hitting_saved}件, 投球 {pitching_saved}件, エラー {errors}件")

    def fetch_hitting_stats(self, mlb_player_id, season):
        """打撃成績を取得"""
        try:
            data = statsapi.player_stat_data(
                mlb_player_id,
                group="hitting",
                type="season",
                sportId=1  # MLB
            )

            if not data or "stats" not in data:
                return None

            for stat_entry in data["stats"]:
                if stat_entry.get("group") == "hitting" and stat_entry.get("season") == str(season):
                    return stat_entry.get("stats")
            return None
        except Exception:
            return None

    def fetch_pitching_stats(self, mlb_player_id, season):
        """投球成績を取得"""
        try:
            data = statsapi.player_stat_data(
                mlb_player_id,
                group="pitching",
                type="season",
                sportId=1  # MLB
            )

            if not data or "stats" not in data:
                return None

            for stat_entry in data["stats"]:
                if stat_entry.get("group") == "pitching" and stat_entry.get("season") == str(season):
                    return stat_entry.get("stats")
            return None
        except Exception:
            return None

    def save_stats(self, player, season, stat_type, stats_data):
        """成績をデータベースに保存"""
        defaults = {}

        if stat_type == StatType.HITTING:
            defaults = {
                "games": self.safe_int(stats_data.get("gamesPlayed")),
                "at_bats": self.safe_int(stats_data.get("atBats")),
                "runs": self.safe_int(stats_data.get("runs")),
                "hits": self.safe_int(stats_data.get("hits")),
                "doubles": self.safe_int(stats_data.get("doubles")),
                "triples": self.safe_int(stats_data.get("triples")),
                "home_runs": self.safe_int(stats_data.get("homeRuns")),
                "rbi": self.safe_int(stats_data.get("rbi")),
                "stolen_bases": self.safe_int(stats_data.get("stolenBases")),
                "batting_avg": self.safe_decimal(stats_data.get("avg")),
                "obp": self.safe_decimal(stats_data.get("obp")),
                "slg": self.safe_decimal(stats_data.get("slg")),
                "ops": self.safe_decimal(stats_data.get("ops")),
            }
        elif stat_type == StatType.PITCHING:
            defaults = {
                "wins": self.safe_int(stats_data.get("wins")),
                "losses": self.safe_int(stats_data.get("losses")),
                "era": self.safe_decimal(stats_data.get("era")),
                "games_pitched": self.safe_int(stats_data.get("gamesPlayed")),
                "games_started": self.safe_int(stats_data.get("gamesStarted")),
                "saves": self.safe_int(stats_data.get("saves")),
                "innings_pitched": self.safe_decimal(stats_data.get("inningsPitched")),
                "strikeouts": self.safe_int(stats_data.get("strikeOuts")),
                "walks_allowed": self.safe_int(stats_data.get("baseOnBalls")),
                "whip": self.safe_decimal(stats_data.get("whip")),
            }

        PlayerStats.objects.update_or_create(
            player=player,
            season=season,
            stat_type=stat_type,
            defaults=defaults
        )

    def safe_int(self, value):
        """安全にintに変換"""
        if value is None:
            return None
        try:
            return int(value)
        except (ValueError, TypeError):
            return None

    def safe_decimal(self, value):
        """安全にDecimalに変換"""
        if value is None:
            return None
        try:
            return Decimal(str(value))
        except (InvalidOperation, ValueError, TypeError):
            return None
