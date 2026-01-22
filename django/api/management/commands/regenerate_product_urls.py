"""
全カードのproduct_urlとproduct_url_longを再生成するコマンド
"""
from django.core.management.base import BaseCommand
from api.models import ToppsCard


class Command(BaseCommand):
    help = '全カードのproduct_urlとproduct_url_longを再生成する'

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

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']

        cards = ToppsCard.objects.filter(title__isnull=False).exclude(title='')

        if limit > 0:
            cards = cards[:limit]

        total = cards.count()
        self.stdout.write(f'処理対象: {total}件のカード')

        updated = 0
        for card in cards:
            short_url, long_url = card.generate_product_urls()

            if dry_run:
                if updated < 5:  # 最初の5件だけ詳細表示
                    self.stdout.write(f'\nカード #{card.card_number}:')
                    self.stdout.write(f'  タイトル: {card.title[:80]}...')
                    self.stdout.write(f'  短いURL: {short_url}')
                    self.stdout.write(f'  長いURL: {long_url}')
            else:
                card.product_url = short_url
                card.product_url_long = long_url
                card.save(update_fields=['product_url', 'product_url_long'])

            updated += 1
            if not dry_run and updated % 100 == 0:
                self.stdout.write(f'{updated}件更新済み...')

        if dry_run:
            self.stdout.write(f'\n[DRY RUN] {total}件のカードが更新対象です')
        else:
            self.stdout.write(self.style.SUCCESS(f'\n{updated}件のカードを更新しました'))
