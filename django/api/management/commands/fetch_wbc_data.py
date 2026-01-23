"""
MLB Stats APIからWBCトーナメントデータ（試合結果・出場選手）を取得して保存するコマンド
"""
import time
from django.core.management.base import BaseCommand
from api.models import Player, WBCTournament, WBCGame, WBCRosterEntry

try:
    import statsapi
except ImportError:
    statsapi = None


class Command(BaseCommand):
    help = "MLB Stats APIからWBCトーナメント・試合・出場選手データを取得・保存"

    WBC_YEARS = [2006, 2009, 2013, 2017, 2023, 2026]

    # WBC優勝・準優勝
    WBC_RESULTS = {
        2006: {'champion': 'Japan', 'runner_up': 'Cuba'},
        2009: {'champion': 'Japan', 'runner_up': 'Korea'},
        2013: {'champion': 'Dominican Republic', 'runner_up': 'Puerto Rico'},
        2017: {'champion': 'United States', 'runner_up': 'Puerto Rico'},
        2023: {'champion': 'Japan', 'runner_up': 'United States'},
        2026: {'champion': '', 'runner_up': ''},
    }

    # WBC代表国チーム名
    WBC_COUNTRIES = {
        'Australia', 'Bahamas', 'Brazil', 'Canada', 'China',
        'Chinese Taipei', 'Colombia', 'Cuba', 'Czech Republic',
        'Dominican Republic', 'France', 'Germany', 'Great Britain',
        'Greece', 'India', 'Israel', 'Italy', 'Japan',
        'Kingdom of the Netherlands', 'Korea', 'Mexico',
        'New Zealand', 'Nicaragua', 'Nigeria', 'Pakistan',
        'Panama', 'Philippines', 'Puerto Rico', 'Republic of Korea',
        'South Africa', 'Spain', 'United States', 'Venezuela',
    }

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="実際には保存せず、取得した情報を表示するだけ",
        )
        parser.add_argument(
            "--year",
            type=int,
            choices=self.WBC_YEARS,
            help="特定の年のWBCのみを取得",
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
        target_year = options["year"]
        delay = options["delay"]

        years_to_scan = [target_year] if target_year else self.WBC_YEARS

        for year in years_to_scan:
            self.stdout.write(f"\n{'='*50}")
            self.stdout.write(f"  WBC {year}")
            self.stdout.write(f"{'='*50}")

            # トーナメント作成/取得
            results = self.WBC_RESULTS.get(year, {})
            if not dry_run:
                tournament, created = WBCTournament.objects.update_or_create(
                    year=year,
                    defaults={
                        'champion': results.get('champion', ''),
                        'runner_up': results.get('runner_up', ''),
                    }
                )
                if created:
                    self.stdout.write(f"  トーナメント作成: WBC {year}")
                else:
                    self.stdout.write(f"  トーナメント更新: WBC {year}")
            else:
                tournament = None
                self.stdout.write(f"  [DRY RUN] トーナメント: WBC {year}")

            # スケジュール取得
            try:
                schedule = statsapi.get('schedule', {
                    'sportId': 51,
                    'season': year,
                    'leagueId': 160,
                })
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  スケジュール取得エラー: {e}"))
                continue

            dates = schedule.get('dates', [])
            self.stdout.write(f"  {len(dates)} 日間の試合データ")

            game_count = 0
            roster_entries = {}  # {(country, mlb_id): player_name}

            for date_data in dates:
                for game in date_data.get('games', []):
                    game_pk = game.get('gamePk')
                    if not game_pk:
                        continue

                    away_team_name = game.get('teams', {}).get('away', {}).get('team', {}).get('name', '')
                    home_team_name = game.get('teams', {}).get('home', {}).get('team', {}).get('name', '')

                    # WBC国同士の試合のみ対象
                    if away_team_name not in self.WBC_COUNTRIES and home_team_name not in self.WBC_COUNTRIES:
                        continue

                    game_date_str = game.get('gameDate', '')[:10]  # "2023-03-21T..."
                    if not game_date_str:
                        game_date_str = date_data.get('date', '')

                    status = game.get('status', {}).get('detailedState', 'Final')

                    # ボックススコアから詳細取得
                    try:
                        boxscore = statsapi.get('game_boxscore', {'gamePk': game_pk})
                        time.sleep(delay)
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"    Game {game_pk} ボックススコア取得エラー: {e}"))
                        continue

                    away_data = boxscore.get('teams', {}).get('away', {})
                    home_data = boxscore.get('teams', {}).get('home', {})

                    away_team = away_data.get('team', {}).get('name', away_team_name)
                    home_team = home_data.get('team', {}).get('name', home_team_name)

                    # 両チームともWBC国でなければスキップ
                    if away_team not in self.WBC_COUNTRIES and home_team not in self.WBC_COUNTRIES:
                        continue

                    # スコア取得
                    away_score = away_data.get('teamStats', {}).get('batting', {}).get('runs', None)
                    home_score = home_data.get('teamStats', {}).get('batting', {}).get('runs', None)

                    game_count += 1

                    if not dry_run and tournament:
                        WBCGame.objects.update_or_create(
                            game_pk=game_pk,
                            defaults={
                                'tournament': tournament,
                                'game_date': game_date_str,
                                'away_team': away_team,
                                'home_team': home_team,
                                'away_score': away_score,
                                'home_score': home_score,
                                'status': status,
                            }
                        )

                    # 出場選手の収集
                    for team_key, team_data in [('away', away_data), ('home', home_data)]:
                        team_name = team_data.get('team', {}).get('name', '')
                        if team_name not in self.WBC_COUNTRIES:
                            continue

                        players = team_data.get('players', {})
                        for player_id_str, player_data in players.items():
                            mlb_id = int(player_id_str.replace('ID', ''))
                            person = player_data.get('person', {})
                            full_name = person.get('fullName', '')

                            key = (team_name, mlb_id)
                            if key not in roster_entries:
                                roster_entries[key] = full_name

            self.stdout.write(f"  {game_count} 試合を処理")
            self.stdout.write(f"  {len(roster_entries)} 名の選手を検出")

            # 出場選手をDBに保存
            if not dry_run and tournament:
                # Player IDマップ
                db_players = {p.mlb_player_id: p for p in Player.objects.filter(mlb_player_id__isnull=False)}

                saved_roster = 0
                for (country, mlb_id), player_name in roster_entries.items():
                    player_obj = db_players.get(mlb_id)
                    WBCRosterEntry.objects.update_or_create(
                        tournament=tournament,
                        mlb_player_id=mlb_id,
                        country=country,
                        defaults={
                            'player_name': player_name,
                            'player': player_obj,
                        }
                    )
                    saved_roster += 1

                self.stdout.write(self.style.SUCCESS(f"  {saved_roster}名のロスター登録完了"))

                # 国別サマリー
                countries = {}
                for (country, _), _ in roster_entries.items():
                    countries[country] = countries.get(country, 0) + 1
                for country, count in sorted(countries.items()):
                    self.stdout.write(f"    {country}: {count}名")
            else:
                self.stdout.write(self.style.WARNING(f"  [DRY RUN] {len(roster_entries)}名のロスター"))

        self.stdout.write(self.style.SUCCESS("\n処理完了"))
