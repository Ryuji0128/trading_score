"""
Topps商品ページから画像URLをスクレイピングして保存するコマンド
"""
import time
from django.core.management.base import BaseCommand
from api.models import ToppsCard

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
except ImportError:
    webdriver = None


class Command(BaseCommand):
    help = 'Topps商品ページから画像URLを取得して保存'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='実際には更新せず、取得したURLを表示するだけ',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='処理するカードの数（デフォルト: 10）',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='既に画像URLが設定されているカードも上書きする',
        )

    def handle(self, *args, **options):
        if not webdriver:
            self.stdout.write(
                self.style.ERROR('Seleniumがインストールされていません。pip install selenium')
            )
            return

        dry_run = options['dry_run']
        limit = options['limit']
        force = options['force']

        # 対象カードを取得
        if force:
            cards = ToppsCard.objects.filter(
                product_url__isnull=False
            ).exclude(product_url='')
        else:
            cards = ToppsCard.objects.filter(
                product_url__isnull=False,
                image_url=''
            ).exclude(product_url='')

        if limit > 0:
            cards = cards[:limit]

        total = cards.count()
        self.stdout.write(f'処理対象: {total}件のカード')

        if total == 0:
            self.stdout.write('処理対象のカードがありません')
            return

        # Chrome設定
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        chrome_options.binary_location = '/usr/bin/chromium'

        driver = None
        updated = 0
        failed = 0

        try:
            self.stdout.write('ブラウザを起動中...')
            driver = webdriver.Chrome(options=chrome_options)
            driver.set_page_load_timeout(30)

            for i, card in enumerate(cards, 1):
                self.stdout.write(f'\n[{i}/{total}] カード #{card.card_number}')
                self.stdout.write(f'  URL: {card.product_url}')

                try:
                    driver.get(card.product_url)
                    time.sleep(3)  # CloudFlareチャレンジ待ち

                    # 画像要素を探す（様々なセレクタを試行）
                    image_url = None
                    selectors = [
                        'img.product-gallery__image',
                        'img[data-zoom]',
                        '.product-gallery img',
                        '.product__main-photos img',
                        'img.photoswipe__image',
                        '.product-single__photo img',
                        'img[itemprop="image"]',
                        '.product-featured-media img',
                    ]

                    for selector in selectors:
                        try:
                            img = driver.find_element(By.CSS_SELECTOR, selector)
                            src = img.get_attribute('src') or img.get_attribute('data-src')
                            if src and ('cdn.shopify' in src or 'topps.com' in src):
                                image_url = src
                                self.stdout.write(f'  ✓ 画像発見 ({selector})')
                                break
                        except:
                            continue

                    # 見つからない場合は全img要素を探す
                    if not image_url:
                        imgs = driver.find_elements(By.TAG_NAME, 'img')
                        for img in imgs:
                            src = img.get_attribute('src') or ''
                            if 'cdn.shopify' in src and ('product' in src.lower() or 'topps' in src.lower()):
                                image_url = src
                                self.stdout.write(f'  ✓ 画像発見 (img tag)')
                                break

                    if image_url:
                        # URLをクリーンアップ（サイズパラメータを適切なサイズに）
                        if '_' in image_url and 'cdn.shopify' in image_url:
                            # 例: xxx_300x.jpg -> xxx_500x.jpg
                            import re
                            image_url = re.sub(r'_\d+x\d*\.', '_500x.', image_url)
                            image_url = re.sub(r'_\d+x\d*\?', '_500x?', image_url)

                        self.stdout.write(f'  画像URL: {image_url[:80]}...')

                        if dry_run:
                            self.stdout.write(self.style.WARNING('  [DRY RUN] 更新スキップ'))
                        else:
                            card.image_url = image_url
                            card.save(update_fields=['image_url'])
                            self.stdout.write(self.style.SUCCESS('  ✓ 保存完了'))
                        updated += 1
                    else:
                        self.stdout.write(self.style.WARNING('  ✗ 画像が見つかりません'))
                        failed += 1

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'  ✗ エラー: {e}'))
                    failed += 1

                # レート制限
                time.sleep(2)

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'ブラウザエラー: {e}'))
            import traceback
            self.stdout.write(traceback.format_exc())

        finally:
            if driver:
                driver.quit()
                self.stdout.write('\nブラウザを終了しました')

        self.stdout.write(f'\n処理完了: 成功 {updated}件, 失敗 {failed}件')
