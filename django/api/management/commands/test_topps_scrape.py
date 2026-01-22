"""
Topps NOWスクレイピングのテストコマンド
最初の1枚のカードだけを取得してデバッグ
"""
import re
from django.core.management.base import BaseCommand

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None
    BeautifulSoup = None


class Command(BaseCommand):
    help = 'Test Topps NOW scraping - fetch only first card for debugging'

    def handle(self, *args, **options):
        if not requests or not BeautifulSoup:
            self.stdout.write(
                self.style.ERROR(
                    'Required libraries not installed. Run: pip install requests beautifulsoup4 lxml'
                )
            )
            return

        url = 'https://www.topps.com/collections/topps-now-archive'
        params = {
            'filter.p.m.topps.brand': 'Topps',
            'filter.p.m.topps.sub_brand': 'Topps NOW®',
            'filter.p.m.topps.licenses': 'Major League Baseball (MLB)',
        }

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        }

        self.stdout.write('Fetching Topps NOW archive page...')

        try:
            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            self.stdout.write(self.style.SUCCESS(f'Status Code: {response.status_code}'))
            self.stdout.write(f'Response encoding: {response.encoding}')
            self.stdout.write(f'Content-Type: {response.headers.get("Content-Type", "N/A")}')
        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Failed to fetch page: {e}'))
            return

        # HTMLをファイルに保存（デバッグ用）
        debug_file = '/tmp/topps_now_debug.html'
        with open(debug_file, 'w', encoding='utf-8') as f:
            f.write(response.text)
        self.stdout.write(f'Saved HTML to {debug_file}')
        self.stdout.write(f'HTML length: {len(response.text)} chars')

        soup = BeautifulSoup(response.text, 'lxml')

        # 様々なセレクタを試してカード要素を探す
        self.stdout.write('\nSearching for card elements...')

        selectors = [
            '.product-item',
            '.product-card',
            '.card-item',
            '[data-product-item]',
            'article',
            '.grid-item',
            '.product',
            '[class*="product"]',
            '[class*="card"]',
        ]

        found_elements = []
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                self.stdout.write(f'  ✓ Found {len(elements)} elements with selector: {selector}')
                found_elements.append((selector, elements))
            else:
                self.stdout.write(f'  ✗ No elements found with: {selector}')

        if not found_elements:
            self.stdout.write(self.style.WARNING('\nNo card elements found with common selectors.'))
            self.stdout.write('Please check the saved HTML file and update selectors.')

            # ページ構造の概要を表示
            self.stdout.write('\nPage structure overview:')
            main_content = soup.select('main, #main, .main-content, [role="main"]')
            if main_content:
                self.stdout.write('Main content area found.')
                # 主要なクラス名を表示
                all_classes = set()
                for elem in main_content[0].find_all(class_=True):
                    all_classes.update(elem.get('class', []))

                product_related = [c for c in all_classes if 'product' in c.lower() or 'card' in c.lower() or 'item' in c.lower()]
                if product_related:
                    self.stdout.write(f'Product-related classes: {", ".join(sorted(product_related)[:10])}')
            return

        # 最初のセレクタで見つかった最初の要素を詳しく解析
        selector, elements = found_elements[0]
        first_card = elements[0]

        self.stdout.write(f'\n{"="*60}')
        self.stdout.write(f'Analyzing first card element (using {selector}):')
        self.stdout.write(f'{"="*60}')

        # カード要素のHTML構造を表示
        self.stdout.write('\nCard HTML (first 1000 chars):')
        self.stdout.write(str(first_card)[:1000])
        self.stdout.write('...\n')

        # 各種情報を抽出
        self.stdout.write('\nExtracting information:')

        # タイトル/商品名
        title_selectors = [
            '.product-title',
            '.card-title',
            'h3',
            'h4',
            'h2',
            '[class*="title"]',
            'a[href*="products"]',
        ]

        for sel in title_selectors:
            elem = first_card.select_one(sel)
            if elem:
                text = elem.get_text(strip=True)
                self.stdout.write(f'  Title ({sel}): {text}')
                break

        # カード番号
        number_selectors = [
            '.card-number',
            '.product-sku',
            '.sku',
            '[class*="number"]',
        ]

        for sel in number_selectors:
            elem = first_card.select_one(sel)
            if elem:
                text = elem.get_text(strip=True)
                self.stdout.write(f'  Number ({sel}): {text}')
                break

        # 発行数 (Print Run)
        pr_selectors = [
            '.print-run',
            '.edition-size',
            '[class*="print"]',
            '[class*="edition"]',
        ]

        for sel in pr_selectors:
            elem = first_card.select_one(sel)
            if elem:
                text = elem.get_text(strip=True)
                self.stdout.write(f'  Print Run ({sel}): {text}')
                break

        # 価格
        price_selectors = [
            '.price',
            '[class*="price"]',
        ]

        for sel in price_selectors:
            elem = first_card.select_one(sel)
            if elem:
                text = elem.get_text(strip=True)
                self.stdout.write(f'  Price ({sel}): {text}')
                break

        # 画像
        img = first_card.select_one('img')
        if img:
            src = img.get('src', '') or img.get('data-src', '') or img.get('data-srcset', '')
            self.stdout.write(f'  Image: {src[:100]}...' if len(src) > 100 else f'  Image: {src}')

        # リンク
        link = first_card.select_one('a')
        if link:
            href = link.get('href', '')
            self.stdout.write(f'  Link: {href}')

        # 全テキスト
        self.stdout.write(f'\nAll text content:')
        self.stdout.write(f'{first_card.get_text(strip=True, separator=" | ")}')

        # 全属性
        self.stdout.write(f'\nAll attributes:')
        for key, value in first_card.attrs.items():
            self.stdout.write(f'  {key}: {value}')

        self.stdout.write(f'\n{"="*60}')
        self.stdout.write(self.style.SUCCESS('Test completed!'))
        self.stdout.write(f'Check {debug_file} for full HTML')
