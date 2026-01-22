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
        parser.add_argument(
            '--url',
            type=str,
            default=None,
            help='Full URL to scrape (e.g., https://www.topps.com/collections/mlb-topps-now-archive?after=...&p=2)'
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
        custom_url = options['url']

        # Chrome設定（Cloudflare対策を含む）
        chrome_options = Options()
        chrome_options.add_argument('--headless=new')  # 新しいheadlessモード
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')  # 自動化検出を無効化
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        # WebDriver検出を回避
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)

        chrome_options.binary_location = '/usr/bin/chromium'

        driver = None
        total_cards_created = 0
        total_cards_updated = 0

        try:
            # WebDriverの初期化
            self.stdout.write('Initializing Chrome WebDriver...')
            driver = webdriver.Chrome(options=chrome_options)

            # WebDriver検出を回避するJavaScriptを実行
            driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
                'source': '''
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined
                    });
                '''
            })

            # URLを決定
            if custom_url:
                full_url = custom_url
                self.stdout.write(f'Using custom URL: {full_url}')
            else:
                # デフォルトURL（1ページ目）
                url = 'https://www.topps.com/collections/topps-now-archive'
                params = '?filter.p.m.topps.brand=Topps&filter.p.m.topps.sub_brand=Topps+NOW%C2%AE&filter.p.m.topps.licenses=Major+League+Baseball+%28MLB%29'
                full_url = url + params
                self.stdout.write(f'Using default URL (page 1): {full_url}')

            self.stdout.write(f'Loading page: {full_url}')
            driver.get(full_url)

            # ページが読み込まれるまで待機（Cloudflareチェックを通過するため長めに）
            self.stdout.write('Waiting for page to load (Cloudflare check)...')
            time.sleep(10)  # Cloudflareチェック通過待機

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

            # より具体的なセレクタを使用（タイトルを含む要素のみ）
            possible_selectors = [
                '//a[contains(@href, "/products/") and contains(., "Topps NOW")]',
                '//div[contains(@class, "product-item")]',
                '//article[contains(@class, "product")]',
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
            # まず要素全体のテキストから取得を試みる
            try:
                all_text = element.text.strip()
                if all_text and 'Topps NOW' in all_text:
                    # "Alex Bregman - 2025 MLB Topps NOW® - Card OS-14 - PR: 2176" のような形式
                    data['title'] = all_text
                    self.stdout.write(f'Title found from element text: {all_text}')
            except Exception:
                pass

            # タイトルが取得できなかった場合は個別要素を探す
            if 'title' not in data:
                title_selectors = [
                    './/h3',
                    './/h4',
                    './/h2',
                    './/*[contains(@class, "title")]',
                    './/*[contains(@class, "name")]',
                    './/*[contains(text(), "Topps NOW")]',
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
                # チームセットの場合は特別処理
                if 'Team Set' in data['title']:
                    # "2025 Houston Astros MLB Topps NOW® Road To Opening Day 11-Card Team Set"
                    # からチーム名を抽出してカード番号を生成
                    team_match = re.search(r'2025\s+(.+?)\s+MLB\s+Topps\s+NOW', data['title'])
                    if team_match:
                        team_name = team_match.group(1).strip()
                        # チーム名を短縮形に変換
                        # 最後の単語(チーム名)の頭文字3文字 + 都市名の頭文字
                        # 例: "Tampa Bay Rays" -> "RAY-TB", "Toronto Blue Jays" -> "JAY-TO"
                        words = team_name.split()
                        if len(words) >= 2:
                            team_abbr = words[-1][:3].upper() + '-' + ''.join([w[0] for w in words[:-1]]).upper()
                        else:
                            team_abbr = team_name[:3].upper()
                        data['card_number'] = f'TEAMSET-{team_abbr}'
                        self.stdout.write(f'Team set card number generated: {data["card_number"]} for {team_name}')
                else:
                    # 通常のカード番号パターン
                    # "Card OS-14", "Card OS13", "Card MLBJP", "Card #123", "#123" のようなパターン
                    patterns = [
                        r'Card\s+([A-Z]+\d+)',            # "Card OS13" (文字+数字、ハイフンなし)
                        r'Card\s+([A-Z]{1,6}-\d+)',       # "Card OS-14" (文字-数字)
                        r'Card\s+([A-Z]{2,6})',           # "Card MLBJP" (文字のみ、2文字以上)
                        r'Card\s+#?(\d+[A-Z]*)',          # "Card #123" or "Card 123"
                        r'#(\d+[A-Z]*)',                  # "#123"
                    ]
                    for pattern in patterns:
                        match = re.search(pattern, data['title'], re.IGNORECASE)
                        if match:
                            data['card_number'] = match.group(1)
                            self.stdout.write(f'Card number found: {data["card_number"]}')
                            break

            # 発行数(PR)の取得
            # まずタイトルから"PR: XXXX"パターンを探す（カンマ区切りに対応）
            if 'title' in data:
                pr_match = re.search(r'PR:\s*([\d,]+)', data['title'])
                if pr_match:
                    # カンマを除去してから整数に変換
                    data['total_print'] = int(pr_match.group(1).replace(',', ''))
                    self.stdout.write(f'Print run found in title: {data["total_print"]}')

            # タイトルから取得できなかった場合は個別要素を探す
            if 'total_print' not in data:
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
                        match = re.search(r'PR:\s*(\d{1,3}(?:,\d{3})*)', pr_text)
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

        # タイトルを取得してクリーニング
        title = card_data.get('title', 'Unknown')

        # タイトルから不要な文字列を除去
        # まず改行とその後のテキストを削除
        title = title.split('\n')[0].strip()

        # "LOOK FOR AUTO-RELICS", "LOOK FOR RELICS", "look for autos" などの文字列を削除
        cleanup_patterns = [
            r'\s*-\s*LOOK FOR AUTO-RELICS\s*',
            r'\s*-\s*LOOK FOR RELICS\s*',
            r'\s*-\s*LOOK FOR AUTOS\s*',
            r'\s*-\s*look for auto-relics\s*',
            r'\s*-\s*look for relics\s*',
            r'\s*-\s*look for autos\s*',
        ]
        for pattern in cleanup_patterns:
            title = re.sub(pattern, '', title, flags=re.IGNORECASE)

        # 連続するハイフンやスペースを整理
        title = re.sub(r'\s*-\s*-\s*', ' - ', title)
        title = re.sub(r'\s+', ' ', title).strip()

        # 末尾のハイフンを削除
        title = title.rstrip(' -').strip()

        # クリーニングされたタイトルを保存
        card_data['title'] = title

        # カード番号がない場合は、タイトルから自動生成
        if 'card_number' not in card_data:
            import hashlib

            # タイトルから特徴的な部分を抽出してカード番号を生成
            card_type = ''

            if 'Team Set' in title or 'team set' in title.lower():
                # チームセット
                if 'Rookie Cup' in title:
                    card_type = 'TS-ROOKIECUP'
                elif 'All-Star' in title:
                    card_type = 'TS-ALLSTAR'
                elif 'Postseason' in title:
                    card_type = 'TS-POSTSEASON'
                else:
                    # その他のチームセット（ハッシュで一意性を確保）
                    card_type = f"TS-{hashlib.md5(title.encode()).hexdigest()[:8].upper()}"
            elif 'Autograph Collectors Pack' in title or 'Collectors Pack' in title:
                # コレクターズパック
                card_type = 'SP-AUTOPACK'
            elif 'MLB The Show' in title:
                # MLB The Show カバーカード
                card_type = 'SP-THESHOW'
            elif 'Cover' in title or 'cover' in title.lower():
                # その他のカバーカード
                card_type = 'SP-COVER'
            elif 'Award' in title or 'Awards' in title:
                # アワード関連
                card_type = 'SP-AWARD'
            else:
                # その他の特殊カード（ハッシュで一意性を確保）
                card_type = f"SP-{hashlib.md5(title.encode()).hexdigest()[:10].upper()}"

            card_data['card_number'] = card_type
            self.stdout.write(f'Generated card number for special card: {card_type}')

        # タイトルから選手名を抽出
        # チームセットの場合は "Team Set" として登録
        if card_data['card_number'].startswith('TS-'):
            player_name = 'Team Set'
        # 特殊カードの場合
        elif card_data['card_number'].startswith('SP-'):
            # MLB The Showカバーなど、複数選手が掲載されている場合
            if 'MLB The Show Cover' in title:
                # "2025 MLB The Show Cover Topps NOW® - Paul Skenes/Elly De La Cruz/Gunnar Henderson"
                # から選手名部分を抽出（最後の " - " 以降）
                parts = title.split(' - ')
                if len(parts) > 1 and '/' in parts[-1]:
                    # 複数選手いる場合は最初の選手名のみ、またはそのまま保持
                    player_name = parts[-1].strip()
                else:
                    player_name = 'Special Card'
            elif 'Autograph Collectors Pack' in title:
                player_name = 'Collectors Pack'
            else:
                # その他の特殊カードは "Special Card"
                player_name = 'Special Card'
        else:
            # 通常カード: " - YYYY MLB Topps NOW" パターンより前の部分を選手名とする
            # 例: "Alex Bregman - 2025 MLB Topps NOW® - Card OS-14 - PR: 2176" -> "Alex Bregman"
            player_name_match = re.match(r'^([^-]+?)(?:\s*-\s*\d{4}\s+MLB\s+Topps\s+NOW)', title, re.IGNORECASE)
            if player_name_match:
                player_name = player_name_match.group(1).strip()
            else:
                # パターンにマッチしない場合は最初の " - " より前を使用
                player_name = title.split(' - ')[0].strip() if ' - ' in title else title.strip()

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
