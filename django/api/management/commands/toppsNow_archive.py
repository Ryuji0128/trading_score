import re
import time
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import Team, Player, ToppsSet, ToppsCard

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    webdriver = None


class Command(BaseCommand):
    help = 'Scrape Topps NOW archive using Selenium and create cards in database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--max-cards',
            type=int,
            default=10,
            help='Maximum number of cards to scrape (default: 10)'
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=2.0,
            help='Delay between actions in seconds (default: 2.0)'
        )
        parser.add_argument(
            '--headless',
            action='store_true',
            help='Run Chrome in headless mode (default: True in production)'
        )

    def handle(self, *args, **options):
        if not webdriver:
            self.stdout.write(
                self.style.ERROR(
                    'Selenium not installed. Run: pip install selenium'
                )
            )
            return

        max_cards = options['max_cards']
        delay = options['delay']
        headless = options.get('headless', True)

        # Chrome設定
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        # ChromeDriverのパスを指定（Debian/Ubuntuの場合）
        chrome_options.binary_location = '/usr/bin/chromium'

        driver = None
        total_cards_created = 0
        total_cards_updated = 0

        try:
            # WebDriverの初期化
            self.stdout.write('Initializing Chrome WebDriver...')
            driver = webdriver.Chrome(options=chrome_options)

            # ページにアクセス
            url = 'https://www.topps.com/collections/topps-now-archive'
            params = '?filter.p.m.topps.brand=Topps&filter.p.m.topps.sub_brand=Topps+NOW%C2%AE&filter.p.m.topps.licenses=Major+League+Baseball+%28MLB%29'
            full_url = url + params

            self.stdout.write(f'Loading page: {full_url}')
            driver.get(full_url)

            # ページが読み込まれるまで待機
            self.stdout.write('Waiting for page to load...')
            time.sleep(5)  # 初期ロード待機

            # JavaScriptでスクロールして遅延ロードされるコンテンツを読み込む
            self.stdout.write('Scrolling to load content...')
            last_height = driver.execute_script("return document.body.scrollHeight")
            scroll_attempts = 0
            max_scroll_attempts = 5

            while scroll_attempts < max_scroll_attempts:
                # ページ下部までスクロール
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(delay)

                # 新しい高さを取得
                new_height = driver.execute_script("return document.body.scrollHeight")

                if new_height == last_height:
                    break

                last_height = new_height
                scroll_attempts += 1
                self.stdout.write(f'Scroll attempt {scroll_attempts}/{max_scroll_attempts}')

            # カード要素を探す
            self.stdout.write('Searching for card elements...')

            # 様々なセレクタを試す
            possible_selectors = [
                '//div[contains(@class, "product-item")]',
                '//article[contains(@class, "product")]',
                '//div[contains(@class, "card")]',
                '//div[@data-product-id]',
                '//a[contains(@href, "/products/")]',
                '//div[contains(@class, "grid-item")]',
            ]

            card_elements = []
            for selector in possible_selectors:
                try:
                    elements = driver.find_elements(By.XPATH, selector)
                    if elements:
                        self.stdout.write(f'Found {len(elements)} elements with selector: {selector}')
                        card_elements = elements
                        break
                except Exception as e:
                    continue

            if not card_elements:
                self.stdout.write(self.style.WARNING('No card elements found'))

                # デバッグ情報を出力
                self.stdout.write('\n=== Page Source Preview ===')
                page_source = driver.page_source
                self.stdout.write(f'Page source length: {len(page_source)} chars')
                self.stdout.write(page_source[:2000])

                # スクリーンショットを保存
                screenshot_path = '/tmp/topps_selenium_debug.png'
                driver.save_screenshot(screenshot_path)
                self.stdout.write(f'Screenshot saved to {screenshot_path}')

                return

            # カード数を制限
            cards_to_process = card_elements[:max_cards]
            self.stdout.write(f'Processing {len(cards_to_process)} cards...')

            for idx, card_element in enumerate(cards_to_process, 1):
                try:
                    self.stdout.write(f'\n--- Card {idx}/{len(cards_to_process)} ---')
                    card_data = self.parse_card_element(card_element, driver)

                    if card_data:
                        self.stdout.write(f'Parsed card data: {card_data}')
                        created, updated = self.save_card(card_data)
                        if created:
                            total_cards_created += 1
                        if updated:
                            total_cards_updated += 1
                    else:
                        self.stdout.write(self.style.WARNING('No data extracted from card'))

                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Error processing card {idx}: {e}'))
                    continue

            self.stdout.write(
                self.style.SUCCESS(
                    f'\nCompleted! Created: {total_cards_created}, Updated: {total_cards_updated}'
                )
            )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Fatal error: {e}'))
            import traceback
            self.stdout.write(traceback.format_exc())

        finally:
            if driver:
                self.stdout.write('Closing browser...')
                driver.quit()

    def parse_card_element(self, element, driver):
        """
        カード要素から情報を抽出
        """
        data = {}

        try:
            # 要素のHTMLを取得（デバッグ用）
            element_html = element.get_attribute('outerHTML')
            self.stdout.write(f'Element HTML preview: {element_html[:500]}')

            # タイトル/選手名の取得
            title_selectors = [
                './/h3',
                './/h4',
                './/h2',
                './/*[contains(@class, "title")]',
                './/*[contains(@class, "name")]',
                './/a[contains(@href, "/products/")]',
            ]

            for selector in title_selectors:
                try:
                    title_elem = element.find_element(By.XPATH, selector)
                    title_text = title_elem.text.strip()
                    if title_text:
                        data['title'] = title_text
                        self.stdout.write(f'Title found: {title_text}')
                        break
                except NoSuchElementException:
                    continue

            # カード番号の取得（タイトルから抽出することが多い）
            if 'title' in data:
                # "2024 Topps NOW Card #123 - Player Name" のようなパターン
                match = re.search(r'(?:Card\s*)?#(\d+[A-Z]*)', data['title'], re.IGNORECASE)
                if match:
                    data['card_number'] = match.group(1)
                    self.stdout.write(f'Card number found: {data["card_number"]}')

            # 発行数(PR)の取得
            pr_selectors = [
                './/*[contains(text(), "PR:")]',
                './/*[contains(text(), "Print Run")]',
                './/*[contains(text(), "Edition")]',
                './/*[contains(@class, "print")]',
            ]

            for selector in pr_selectors:
                try:
                    pr_elem = element.find_element(By.XPATH, selector)
                    pr_text = pr_elem.text.strip()
                    # "PR: 1,234" や "Print Run: 1234" から数字を抽出
                    match = re.search(r'(\d{1,3}(?:,\d{3})*)', pr_text)
                    if match:
                        data['total_print'] = int(match.group(1).replace(',', ''))
                        self.stdout.write(f'Print run found: {data["total_print"]}')
                        break
                except NoSuchElementException:
                    continue

            # 画像URL
            try:
                img_elem = element.find_element(By.XPATH, './/img')
                img_src = img_elem.get_attribute('src') or img_elem.get_attribute('data-src')
                if img_src:
                    data['image_url'] = img_src
                    self.stdout.write(f'Image URL found: {img_src[:100]}')
            except NoSuchElementException:
                pass

            # リンクURL
            try:
                link_elem = element.find_element(By.XPATH, './/a[contains(@href, "/products/")]')
                href = link_elem.get_attribute('href')
                if href:
                    data['detail_url'] = href
                    self.stdout.write(f'Detail URL found: {href}')
            except NoSuchElementException:
                pass

            # 全テキストを取得（デバッグ用）
            all_text = element.text.strip()
            self.stdout.write(f'All text: {all_text[:200]}')

        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Error extracting data: {e}'))

        return data if data else None

    def parse_date(self, date_text):
        """日付文字列をパース"""
        formats = [
            '%Y-%m-%d',
            '%m/%d/%Y',
            '%B %d, %Y',
            '%b %d, %Y',
        ]

        for fmt in formats:
            try:
                return datetime.strptime(date_text, fmt).date()
            except ValueError:
                continue

        return None

    @transaction.atomic
    def save_card(self, card_data):
        """カードデータをデータベースに保存"""
        created = False
        updated = False

        # Topps NOWセットを取得または作成
        year = datetime.now().year
        topps_set, _ = ToppsSet.objects.get_or_create(
            year=year,
            name='Topps NOW',
            defaults={
                'brand': 'Topps',
                'slug': f'topps-now-{year}',
            }
        )

        # カード番号が必要
        if 'card_number' not in card_data:
            self.stdout.write(self.style.WARNING('Card number missing, skipping'))
            return created, updated

        # タイトルから選手名とチーム名を抽出
        player_name = card_data.get('title', 'Unknown Player')

        # カード番号部分を除去して選手名を抽出
        player_name = re.sub(r'(?:Card\s*)?#\d+[A-Z]*\s*-?\s*', '', player_name, flags=re.IGNORECASE)
        player_name = player_name.strip()

        # 選手を検索または作成
        player, _ = Player.objects.get_or_create(
            full_name=player_name,
            defaults={
                'first_name': player_name.split()[0] if player_name else '',
                'last_name': ' '.join(player_name.split()[1:]) if len(player_name.split()) > 1 else '',
                'position': 'P',  # デフォルト
            }
        )

        # カードを作成または更新
        card, created = ToppsCard.objects.update_or_create(
            topps_set=topps_set,
            card_number=card_data['card_number'],
            defaults={
                'player': player,
                'team': player.team,
                'title': card_data.get('title', ''),
                'total_print': card_data.get('total_print'),
                'image_url': card_data.get('image_url', ''),
                'is_rookie': False,
            }
        )

        if not created:
            updated = True

        self.stdout.write(
            self.style.SUCCESS(
                f"{'Created' if created else 'Updated'} card: {card}"
            )
        )

        return created, updated
