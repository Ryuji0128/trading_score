"""
「PR:」や「look for」を含む長いproduct_urlを短いURLに更新するコマンド
"""
import re
import urllib.parse
from django.core.management.base import BaseCommand
from api.models import ToppsCard


class Command(BaseCommand):
    help = '「PR:」や「look for」を含む長いproduct_urlを短いURLに更新する'

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

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']
        card_number = options.get('card_number')

        # PR:やlook forを含むURLを持つカードを取得
        cards = ToppsCard.objects.filter(
            product_url__isnull=False
        ).exclude(product_url='')

        if card_number:
            cards = cards.filter(card_number=card_number)

        # 長いURLのパターンでフィルタ（PR:やlook-forを含む）
        long_url_cards = []
        for card in cards:
            url_lower = card.product_url.lower()
            if 'pr%3a' in url_lower or 'pr:' in url_lower or 'look-for' in url_lower or 'look%20for' in url_lower:
                long_url_cards.append(card)

        if limit > 0:
            long_url_cards = long_url_cards[:limit]

        total = len(long_url_cards)
        self.stdout.write(f'修正対象: {total}件のカード（PR:またはlook forを含むURL）')

        if total == 0:
            self.stdout.write('修正対象のカードがありません')
            return

        updated = 0
        for i, card in enumerate(long_url_cards, 1):
            self.stdout.write(f'\n[{i}/{total}] カード #{card.card_number}')
            self.stdout.write(f'  現在: {card.product_url}')

            short_url = self.generate_short_url(card.title)
            self.stdout.write(f'  新URL: {short_url}')

            if dry_run:
                self.stdout.write(self.style.WARNING('  [DRY RUN] 更新スキップ'))
            else:
                card.product_url = short_url
                card.save(update_fields=['product_url'])
                self.stdout.write(self.style.SUCCESS('  ✓ 更新完了'))
            updated += 1

        if dry_run:
            self.stdout.write(f'\n[DRY RUN] {updated}件のカードが更新対象です')
        else:
            self.stdout.write(self.style.SUCCESS(f'\n{updated}件のカードを更新しました'))
