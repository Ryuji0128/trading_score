"""
HTMLファイルの内容を分析
"""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Analyze saved HTML file'

    def handle(self, *args, **options):
        try:
            with open('/tmp/topps_now_debug.html', 'r', encoding='utf-8') as f:
                content = f.read()
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR('File not found. Run test_topps_scrape first.'))
            return

        self.stdout.write(f'Total length: {len(content)} chars\n')

        self.stdout.write('=== First 2000 characters ===')
        self.stdout.write(content[:2000])

        self.stdout.write('\n\n=== Last 2000 characters ===')
        self.stdout.write(content[-2000:])

        self.stdout.write('\n\n=== Searching for key terms ===')
        search_terms = [
            'shopify', 'Shopify', 'product', 'item', '__NEXT',
            'React', 'Vue', 'collection', 'Topps NOW', 'MLB'
        ]

        for term in search_terms:
            count = content.lower().count(term.lower())
            if count > 0:
                self.stdout.write(f'{term}: {count} occurrences')

                # 最初の出現位置の前後を表示
                idx = content.lower().find(term.lower())
                if idx >= 0:
                    start = max(0, idx - 100)
                    end = min(len(content), idx + 100)
                    snippet = content[start:end].replace('\n', ' ')
                    self.stdout.write(f'  Context: ...{snippet}...')
