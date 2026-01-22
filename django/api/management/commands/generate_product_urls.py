from django.core.management.base import BaseCommand
from api.models import ToppsCard


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

        # 対象カードを取得
        if force:
            cards = ToppsCard.objects.filter(title__isnull=False).exclude(title='')
        else:
            cards = ToppsCard.objects.filter(
                title__isnull=False,
                product_url=''
            ).exclude(title='')

        if limit > 0:
            cards = cards[:limit]

        total = cards.count()
        self.stdout.write(f'処理対象: {total}件のカード')

        updated = 0
        for card in cards:
            url = card.generate_product_url()

            if dry_run:
                self.stdout.write(f'[DRY RUN] カード #{card.card_number}:')
                self.stdout.write(f'  タイトル: {card.title}')
                self.stdout.write(f'  生成URL: {url}')
                self.stdout.write('')
            else:
                card.product_url = url
                card.save(update_fields=['product_url'])
                updated += 1
                if updated % 100 == 0:
                    self.stdout.write(f'{updated}件更新済み...')

        if dry_run:
            self.stdout.write(self.style.WARNING(f'DRY RUNモード: {total}件のURLが生成されます'))
        else:
            self.stdout.write(self.style.SUCCESS(f'{updated}件のカードにURLを設定しました'))
