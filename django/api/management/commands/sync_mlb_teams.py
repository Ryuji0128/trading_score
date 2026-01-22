import requests
from django.core.management.base import BaseCommand
from api.models import Team, League, Division


class Command(BaseCommand):
    help = 'MLB公式APIからチーム情報を同期します'

    def handle(self, *args, **options):
        self.stdout.write('MLB APIからチーム情報を取得中...')
        
        try:
            # MLB API からチーム情報を取得
            response = requests.get('https://statsapi.mlb.com/api/v1/teams?sportId=1&season=2024')
            response.raise_for_status()
            data = response.json()
            
            teams_data = data.get('teams', [])
            updated_count = 0
            not_found_count = 0
            
            for team_data in teams_data:
                mlb_team_id = team_data['id']
                abbreviation = team_data.get('abbreviation', '')
                team_name = team_data.get('teamName', '')
                location_name = team_data.get('locationName', '')
                full_name = team_data.get('name', '')
                
                # 既存のチームを略称で検索
                try:
                    team = Team.objects.get(abbreviation=abbreviation)
                    
                    # MLB Team IDを更新
                    team.mlb_team_id = mlb_team_id
                    team.ballpark = team_data.get('venue', {}).get('name', '')
                    team.save()
                    
                    updated_count += 1
                    self.stdout.write(self.style.SUCCESS(
                        f'更新: {full_name} ({abbreviation}) -> MLB ID: {mlb_team_id}'
                    ))
                    
                except Team.DoesNotExist:
                    not_found_count += 1
                    self.stdout.write(self.style.WARNING(
                        f'未登録: {full_name} ({abbreviation}) - MLB ID: {mlb_team_id}'
                    ))
            
            self.stdout.write(self.style.SUCCESS(
                f'\n完了: {updated_count}件更新, {not_found_count}件未登録'
            ))
            
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'API取得エラー: {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'エラー: {e}'))
