"""
404が返ってくるproduct_urlを修正するコマンド
"""
import re
import urllib.parse
import time
from django.core.management.base import BaseCommand
from api.models import ToppsCard

try:
    import requests
except ImportError:
    requests = None


class Command(BaseCommand):
    help = '404が返ってくるproduct_urlをチェックして修正する'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='実際には更新せず、修正対象を表示するだけ',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=0,
            help='処理するカードの数を制限（0で全件）',
        )
        parser.add_argument(
            '--card-number',
            type=str,
            help='特定のカード番号のみ処理',
        )

    def generate_short_url(self, title):
        """Card XXX の後を削除した短いURLを生成"""
        if not title:
            return ""

        # "Card XXX" の後にある全てを削除（改行も含める）
        clean_title = re.sub(r'(Card\s+[\w-]+).*', r'\1', title, flags=re.IGNORECASE | re.DOTALL)

        slug = clean_title.lower()
        slug = re.sub(r'\s*/\s*', '-', slug)
        slug = re.sub(r'\s*-\s*', '-', slug)
        slug = re.sub(r'\s+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        slug = slug.strip('-')
        slug = urllib.parse.quote(slug, safe='-')

        return f"https://www.topps.com/products/{slug}"

    def check_url(self, url):
        """URLが有効かどうかチェック（HEADリクエスト）"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.head(url, headers=headers, timeout=10, allow_redirects=True)
            return response.status_code, response.status_code in (200, 403)
        except Exception as e:
            return 0, False

    def handle(self, *args, **options):
        if not requests:
            self.stdout.write(self.style.ERROR('requestsがインストールされていません'))
            return

        dry_run = options['dry_run']
        limit = options['limit']
        card_number = options.get('card_number')

        cards = ToppsCard.objects.filter(
            product_url__isnull=False
        ).exclude(product_url='')

        if card_number:
            cards = cards.filter(card_number=card_number)

        if limit > 0:
            cards = cards[:limit]

        total = cards.count()
        self.stdout.write(f'チェック対象: {total}件のカード')

        checked = 0
        fixed = 0
        already_ok = 0
        failed = 0

        for card in cards:
            checked += 1
            self.stdout.write(f'\n[{checked}/{total}] カード #{card.card_number}')

            current_url = card.product_url
            self.stdout.write(f'  現在のURL: {current_url}')

            # 現在のURLをチェック
            status_code, is_valid = self.check_url(current_url)
            if is_valid:
                self.stdout.write(self.style.SUCCESS(f'  ✓ OK ({status_code})'))
                already_ok += 1
            else:
                self.stdout.write(self.style.WARNING(f'  ✗ エラー ({status_code})'))

                # 短いURLを生成
                short_url = self.generate_short_url(card.title)
                self.stdout.write(f'  新しいURL: {short_url}')

                # 新しいURLをチェック
                new_status, new_is_valid = self.check_url(short_url)
                if new_is_valid:
                    self.stdout.write(self.style.SUCCESS(f'  ✓ 新URLは有効 ({new_status})'))

                    if dry_run:
                        self.stdout.write('  [DRY RUN] 更新スキップ')
                    else:
                        card.product_url = short_url
                        card.save(update_fields=['product_url'])
                        self.stdout.write(self.style.SUCCESS('  ✓ 更新完了'))
                    fixed += 1
                else:
                    self.stdout.write(self.style.ERROR(f'  ✗ 新URLも無効 ({new_status})'))
                    failed += 1

            # レート制限
            time.sleep(0.5)

        self.stdout.write(f'\n処理完了:')
        self.stdout.write(f'  OK: {already_ok}件')
        self.stdout.write(f'  修正: {fixed}件')
        self.stdout.write(f'  修正失敗: {failed}件')
