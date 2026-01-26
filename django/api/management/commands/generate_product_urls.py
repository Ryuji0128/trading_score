import re
import unicodedata

from django.core.management.base import BaseCommand
from api.models import ToppsCard


def make_slug(text):
    """テキストをURL用のスラッグに変換（アクセント文字をASCIIに変換）"""
    slug = text.lower()
    # アクセント付き文字をASCIIに変換（í→i, é→e, ñ→n など）
    slug = unicodedata.normalize('NFKD', slug)
    slug = slug.encode('ascii', 'ignore').decode('ascii')
    slug = slug.replace('.', '')  # ドットを削除
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug


class Command(BaseCommand):
    help = '既存のToppsカードにTopps公式商品ページのURLを生成・設定する'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='実際には更新せず、生成されるURLを表示するだけ',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=0,
            help='処理するカードの数を制限（0で全件）',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='既にURLが設定されているカードも上書きする',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']
        force = options['force']

        # 対象カードを取得（発行日がないカード、TEAMSETを除外）
        if force:
            cards = ToppsCard.objects.filter(
                title__isnull=False,
                release_date__isnull=True
            ).exclude(title='').exclude(card_number__icontains='teamset')
        else:
            cards = ToppsCard.objects.filter(
                title__isnull=False,
                product_url='',
                release_date__isnull=True
            ).exclude(title='').exclude(card_number__icontains='teamset')

        if limit > 0:
            cards = cards[:limit]

        total = cards.count()
        self.stdout.write(f'処理対象: {total}件のカード')

        updated = 0
        for card in cards:
            # 選手名-2025-mlb-topps-now®-card-カード番号 の形式でURL生成
            player_name = make_slug(card.player.full_name)
            card_num = card.card_number.lower()
            short_url = f"https://www.topps.com/products/{player_name}-2025-mlb-topps-now%C2%AE-card-{card_num}"
            long_url = f"https://www.topps.com/products/{player_name}-2025-mlb-topps-now%C2%AE-card-{card_num}-look-for-auto-relics"

            if dry_run:
                self.stdout.write(f'[DRY RUN] カード #{card.card_number}:')
                self.stdout.write(f'  選手名: {card.player.full_name}')
                self.stdout.write(f'  短いURL: {short_url}')
                self.stdout.write(f'  長いURL: {long_url}')
                self.stdout.write('')
            else:
                card.product_url = short_url
                card.product_url_long = long_url
                card.save(update_fields=['product_url', 'product_url_long'])
                updated += 1
                if updated % 100 == 0:
                    self.stdout.write(f'{updated}件更新済み...')

        if dry_run:
            self.stdout.write(self.style.WARNING(f'DRY RUNモード: {total}件のURLが生成されます'))
        else:
            self.stdout.write(self.style.SUCCESS(f'{updated}件のカードにURLを設定しました'))
