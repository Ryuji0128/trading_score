"""
MLB Stats APIからWBC出場選手情報を取得してPlayerモデルに保存するコマンド
"""
import time
from django.core.management.base import BaseCommand
from api.models import Player

try:
    import statsapi
except ImportError:
    statsapi = None


class Command(BaseCommand):
    help = "MLB Stats APIからWBC出場選手情報を取得・保存"

    WBC_YEARS = [2006, 2009, 2013, 2017, 2023]
    WBC_LEAGUE_ID = 160  # World Baseball Classic

    # WBC代表国チーム名（MLBチーム名ではないもの）
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
            help="実際には更新せず、取得した情報を表示するだけ",
        )
        parser.add_argument(
            "--year",
            type=int,
            choices=self.WBC_YEARS,
            help="特定の年のWBCのみをスキャン",
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

        # WBC出場選手を格納: {mlb_player_id: {years: set(), country: str}}
        wbc_players = {}

        for year in years_to_scan:
            self.stdout.write(f"\n=== WBC {year} をスキャン中 ===")

            try:
                # WBCの試合スケジュールを取得
                schedule = statsapi.get('schedule', {
                    'sportId': 51,  # International Baseball
                    'season': year,
                    'leagueId': self.WBC_LEAGUE_ID
                })

                dates = schedule.get('dates', [])
                self.stdout.write(f"  {len(dates)} 日間の試合データ")

                game_count = 0
                for date in dates:
                    for game in date.get('games', []):
                        game_pk = game.get('gamePk')
                        if not game_pk:
                            continue

                        game_count += 1
                        away_team = game.get('teams', {}).get('away', {}).get('team', {}).get('name', 'Unknown')
                        home_team = game.get('teams', {}).get('home', {}).get('team', {}).get('name', 'Unknown')

                        # ボックススコアから選手を取得
                        try:
                            boxscore = statsapi.get('game_boxscore', {'gamePk': game_pk})

                            for team_key in ['away', 'home']:
                                team_data = boxscore.get('teams', {}).get(team_key, {})
                                team_name = team_data.get('team', {}).get('name', '')

                                # MLBチームのエキシビション試合はスキップ
                                if team_name not in self.WBC_COUNTRIES:
                                    continue

                                players = team_data.get('players', {})

                                for player_id_str, player_data in players.items():
                                    # "ID660271" -> 660271
                                    mlb_id = int(player_id_str.replace('ID', ''))
                                    person = player_data.get('person', {})
                                    full_name = person.get('fullName', '')

                                    if mlb_id not in wbc_players:
                                        wbc_players[mlb_id] = {
                                            'name': full_name,
                                            'years': set(),
                                            'country': team_name
                                        }

                                    wbc_players[mlb_id]['years'].add(year)
                                    # 最新の代表国で上書き
                                    wbc_players[mlb_id]['country'] = team_name

                            time.sleep(delay)

                        except Exception as e:
                            self.stdout.write(self.style.WARNING(f"    Game {game_pk} エラー: {e}"))
                            continue

                self.stdout.write(f"  {game_count} 試合をスキャン完了")

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  WBC {year} スキャンエラー: {e}"))
                continue

        self.stdout.write(f"\n=== 合計 {len(wbc_players)} 名のWBC出場選手を検出 ===")

        # DBに保存されているPlayer（mlb_player_idあり）とマッチング
        db_players = Player.objects.filter(mlb_player_id__isnull=False)
        db_player_map = {p.mlb_player_id: p for p in db_players}

        updated = 0
        matched = 0

        for mlb_id, wbc_info in wbc_players.items():
            if mlb_id in db_player_map:
                matched += 1
                player = db_player_map[mlb_id]
                years_str = ','.join(map(str, sorted(wbc_info['years'])))
                country = wbc_info['country']

                self.stdout.write(
                    f"  {player.full_name}: WBC {years_str} ({country})"
                )

                if not dry_run:
                    # 既存のWBC年に追加
                    existing_years = set(player.wbc_years.split(',')) if player.wbc_years else set()
                    existing_years.discard('')
                    new_years = existing_years | wbc_info['years']
                    player.wbc_years = ','.join(map(str, sorted(new_years)))
                    player.wbc_country = country
                    player.save(update_fields=['wbc_years', 'wbc_country'])
                    updated += 1

        if dry_run:
            self.stdout.write(self.style.WARNING(f"\n[DRY RUN] {matched}名のDB登録選手がWBC出場"))
        else:
            self.stdout.write(self.style.SUCCESS(f"\n{updated}名のWBC情報を更新しました"))
