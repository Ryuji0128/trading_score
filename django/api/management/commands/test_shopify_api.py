"""
Shopify Products JSON APIをテスト
"""
from django.core.management.base import BaseCommand
import json

try:
    import requests
except ImportError:
    requests = None


class Command(BaseCommand):
    help = 'Test Shopify Products JSON API'

    def handle(self, *args, **options):
        if not requests:
            self.stdout.write(
                self.style.ERROR('requests not installed')
            )
            return

        # ShopifyサイトのproductsエンドポイントをテスT
        base_url = 'https://www.topps.com'

        # 試すべきエンドポイント
        endpoints = [
            '/products.json',
            '/collections/topps-now-archive/products.json',
            '/collections/topps-now-archive.json',
        ]

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
        }

        for endpoint in endpoints:
            url = base_url + endpoint
            self.stdout.write(f'\nTrying: {url}')

            try:
                response = requests.get(url, headers=headers, timeout=30)
                self.stdout.write(f'Status: {response.status_code}')

                if response.status_code == 200:
                    try:
                        data = response.json()
                        self.stdout.write(self.style.SUCCESS('✓ JSON response received!'))

                        # データ構造を表示
                        self.stdout.write(f'Keys: {list(data.keys())}')

                        # 商品データがある場合
                        if 'products' in data:
                            products = data['products']
                            self.stdout.write(f'Found {len(products)} products')

                            if products:
                                # 最初の商品を詳しく表示
                                first_product = products[0]
                                self.stdout.write('\n=== First Product ===')
                                self.stdout.write(json.dumps(first_product, indent=2)[:2000])

                                self.stdout.write('\n=== Product Fields ===')
                                for key in first_product.keys():
                                    value = first_product[key]
                                    value_type = type(value).__name__
                                    if isinstance(value, (str, int, float, bool)):
                                        self.stdout.write(f'  {key} ({value_type}): {value}')
                                    else:
                                        self.stdout.write(f'  {key} ({value_type}): {len(value) if hasattr(value, "__len__") else "complex"}')

                        # コレクション情報がある場合
                        if 'collection' in data:
                            collection = data['collection']
                            self.stdout.write(f'\nCollection: {collection.get("title", "N/A")}')
                            self.stdout.write(f'Products count: {collection.get("products_count", "N/A")}')

                    except json.JSONDecodeError:
                        self.stdout.write(self.style.WARNING('Not valid JSON'))
                        self.stdout.write(f'Content preview: {response.text[:500]}')

                else:
                    self.stdout.write(f'Error: {response.status_code}')

            except requests.RequestException as e:
                self.stdout.write(self.style.ERROR(f'Request failed: {e}'))

        # パラメータ付きでも試す
        self.stdout.write('\n\n=== Trying with filters ===')
        url = base_url + '/collections/topps-now-archive/products.json'
        params = {
            'limit': 10,
        }

        try:
            response = requests.get(url, params=params, headers=headers, timeout=30)
            self.stdout.write(f'Status: {response.status_code}')

            if response.status_code == 200:
                data = response.json()
                self.stdout.write(self.style.SUCCESS(f'Got {len(data.get("products", []))} products'))

        except Exception as e:
            self.stdout.write(f'Error: {e}')
