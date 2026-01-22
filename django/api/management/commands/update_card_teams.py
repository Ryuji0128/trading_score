import requests
import time
from django.core.management.base import BaseCommand
from api.models import ToppsCard, Team


class Command(BaseCommand):
    help = 'MLB APIから選手情報を取得して、Topps Nowカードにチーム情報を関連付けます'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='処理するカード数の上限'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='実際には更新せず、結果のみ表示'
        )

    def handle(self, *args, **options):
        limit = options.get('limit')
        dry_run = options.get('dry_run')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Dry runモード: データは更新されません'))
        
        # チームが未設定のカードを取得
        cards = ToppsCard.objects.filter(team__isnull=True).select_related('player')
        
        if limit:
            cards = cards[:limit]
            self.stdout.write(f'最初の{limit}枚のカードを処理します')
        
        total_cards = cards.count()
        self.stdout.write(f'チームが未設定のカード: {total_cards}枚')
        
        if total_cards == 0:
            self.stdout.write(self.style.SUCCESS('全カードにチーム情報が設定されています'))
            return
        
        updated_count = 0
        not_found_count = 0
        error_count = 0
        skipped_count = 0
        
        for i, card in enumerate(cards, 1):
            player = card.player
            
            # Major League Baseballなど、特殊な選手はスキップ
            if 'Major League' in player.full_name or 'Team Set' in player.full_name:
                skipped_count += 1
                self.stdout.write(f'[{i}/{total_cards}] スキップ: {player.full_name} (特殊カード)')
                continue
            
            self.stdout.write(f'[{i}/{total_cards}] 処理中: {player.full_name}')
            
            try:
                # MLB APIで選手を検索
                response = requests.get(
                    'https://statsapi.mlb.com/api/v1/people/search',
                    params={
                        'names': player.full_name,
                        'sportId': 1,  # MLB
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    people = data.get('people', [])
                    
                    if people:
                        # 最初に見つかった選手を使用
                        person = people[0]
                        player_id = person.get('id')
                        
                        # 選手の詳細情報を取得（チーム情報を含む）
                        detail_response = requests.get(
                            f'https://statsapi.mlb.com/api/v1/people/{player_id}',
                            params={'hydrate': 'currentTeam'},
                            timeout=10
                        )
                        
                        if detail_response.status_code == 200:
                            detail_data = detail_response.json()
                            person_detail = detail_data.get('people', [])[0]
                            current_team = person_detail.get('currentTeam')
                            
                            if current_team:
                                mlb_team_id = current_team.get('id')
                                team_name = current_team.get('name')
                                
                                # mlb_team_idでチームを検索
                                try:
                                    team = Team.objects.get(mlb_team_id=mlb_team_id)
                                    
                                    if not dry_run:
                                        card.team = team
                                        card.save()
                                    
                                    updated_count += 1
                                    self.stdout.write(self.style.SUCCESS(
                                        f'  ✓ チーム設定: {team.full_name}'
                                    ))
                                except Team.DoesNotExist:
                                    not_found_count += 1
                                    self.stdout.write(self.style.WARNING(
                                        f'  ! チーム未登録: {team_name} (MLB ID: {mlb_team_id})'
                                    ))
                            else:
                                not_found_count += 1
                                self.stdout.write(self.style.WARNING(
                                    f'  ! チーム情報なし'
                                ))
                        
                        # API レート制限対策
                        time.sleep(0.3)
                    else:
                        not_found_count += 1
                        self.stdout.write(self.style.WARNING(
                            f'  ! 選手が見つかりません'
                        ))
                else:
                    error_count += 1
                    self.stdout.write(self.style.ERROR(
                        f'  ✗ API エラー: HTTP {response.status_code}'
                    ))
                
                # API レート制限対策
                time.sleep(0.3)
                
            except requests.RequestException as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f'  ✗ リクエストエラー: {e}'))
            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f'  ✗ エラー: {e}'))
        
        # サマリー
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS(f'完了: {updated_count}枚のカードを更新'))
        if skipped_count > 0:
            self.stdout.write(f'スキップ: {skipped_count}枚')
        if not_found_count > 0:
            self.stdout.write(self.style.WARNING(f'チーム情報なし: {not_found_count}枚'))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'エラー: {error_count}枚'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nDry runモードのため、実際の更新は行われませんでした'))
