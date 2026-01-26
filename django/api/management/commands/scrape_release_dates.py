"""
Topps商品ページから発行日（release date）をスクレイピングして保存するコマンド
"""
import re
import time
from datetime import datetime
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
    help = "Topps商品ページから発行日を取得して保存"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="実際には更新せず、取得した日付を表示するだけ",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=10,
            help="処理するカードの数（デフォルト: 10）",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="既に発行日が設定されているカードも上書きする",
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=3.0,
            help="リクエスト間の待機時間（秒、デフォルト: 3.0）",
        )

    def handle(self, *args, **options):
        if not webdriver:
            self.stdout.write(
                self.style.ERROR("Seleniumがインストールされていません。pip install selenium")
            )
            return

        dry_run = options["dry_run"]
        limit = options["limit"]
        force = options["force"]
        delay = options["delay"]

        # 対象カードを取得（product_urlがあるもの）
        cards = ToppsCard.objects.filter(
            product_url__isnull=False
        ).exclude(product_url="")

        if not force:
            cards = cards.filter(release_date__isnull=True)

        if limit > 0:
            cards = cards[:limit]

        total = cards.count()
        self.stdout.write(f"処理対象: {total}件のカード")

        if total == 0:
            self.stdout.write("処理対象のカードがありません")
            return

        # Chrome設定（Cloudflare対策を含む）
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument(
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        chrome_options.binary_location = "/usr/bin/chromium"

        updated = 0
        failed = 0

        for i, card in enumerate(cards, 1):
            self.stdout.write(f"\n[{i}/{total}] カード #{card.card_number}")

            # 長いURL（product_url_long）を使用
            url = card.product_url_long if card.product_url_long else card.product_url
            self.stdout.write(f"  URL: {url}")

            driver = None
            try:
                # 各カードごとに新しいブラウザインスタンスを作成（Cloudflare対策）
                driver = webdriver.Chrome(options=chrome_options)
                driver.set_page_load_timeout(30)

                # WebDriver検出を回避するJavaScript
                driver.execute_cdp_cmd(
                    "Page.addScriptToEvaluateOnNewDocument",
                    {
                        "source": "Object.defineProperty(navigator, 'webdriver', { get: () => undefined });"
                    },
                )

                driver.get(url)
                time.sleep(delay)  # Cloudflareチャレンジ待ち

                release_date = self.extract_release_date(driver)

                if release_date:
                    self.stdout.write(self.style.SUCCESS(f"  発行日: {release_date}"))

                    if dry_run:
                        self.stdout.write(self.style.WARNING("  [DRY RUN] 更新スキップ"))
                    else:
                        card.release_date = release_date
                        card.save(update_fields=["release_date"])
                        self.stdout.write(self.style.SUCCESS("  保存完了"))
                    updated += 1
                else:
                    self.stdout.write(self.style.WARNING("  発行日が見つかりません"))
                    failed += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  エラー: {e}"))
                import traceback
                self.stdout.write(traceback.format_exc())
                failed += 1

            finally:
                if driver:
                    driver.quit()

            # レート制限（Cloudflare対策のため待機）
            if i < total:
                time.sleep(2)

        self.stdout.write(f"\n処理完了: 成功 {updated}件, 失敗 {failed}件")

    def extract_release_date(self, driver):
        """ページから発行日を抽出する"""

        try:
            page_text = driver.find_element(By.TAG_NAME, "body").text

            # 主要な日付パターン（Toppsページで確認された形式）
            date_patterns = [
                # "Product is available from Mar 28, 2025" - 実際にToppsサイトで確認された形式
                r"(?:Product\s+is\s+)?(?:available|Available)\s+(?:from\s+)?(\w{3,9}\s+\d{1,2},?\s+\d{4})",
                # "Available: January 22, 2025" or "Release Date: Jan 22, 2025"
                r"(?:Available|Release(?:d)?(?:\s+Date)?)\s*[:\-]?\s*(\w+\s+\d{1,2},?\s+\d{4})",
                # "Ships from Mar 28, 2025"
                r"Ships?\s+(?:from\s+)?(\w{3,9}\s+\d{1,2},?\s+\d{4})",
                # "01/22/2025" or "1/22/2025"
                r"(?:Available|Release(?:d)?(?:\s+Date)?)\s*[:\-]?\s*(\d{1,2}/\d{1,2}/\d{4})",
                # "2025-01-22"
                r"(?:Available|Release(?:d)?(?:\s+Date)?)\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})",
            ]
            
            for pattern in date_patterns:
                match = re.search(pattern, page_text, re.IGNORECASE)
                if match:
                    parsed = self.parse_date(match.group(1))
                    if parsed:
                        return parsed
        except Exception as e:
            self.stdout.write(f"  テキスト抽出エラー: {e}")

        # 様々なセレクタを試行
        date_selectors = [
            # メタデータ
            'meta[property="product:release_date"]',
            'meta[name="release_date"]',
            # 構造化データ内の日付
            '[itemprop="releaseDate"]',
            '[itemprop="datePublished"]',
            # 一般的なクラス名
            ".product-release-date",
            ".release-date",
            ".product__release-date",
            ".availability-date",
        ]

        # セレクタベースの検索
        for selector in date_selectors:
            try:
                elem = driver.find_element(By.CSS_SELECTOR, selector)
                
                # メタタグの場合はcontent属性を取得
                if elem.tag_name == "meta":
                    date_text = elem.get_attribute("content")
                else:
                    date_text = elem.text.strip()
                
                if date_text:
                    parsed = self.parse_date(date_text)
                    if parsed:
                        return parsed
            except:
                continue

        # JSON-LDスクリプトから抽出を試行
        try:
            import json
            scripts = driver.find_elements(By.CSS_SELECTOR, 'script[type="application/ld+json"]')
            for script in scripts:
                content = script.get_attribute("innerHTML")
                if content:
                    try:
                        data = json.loads(content)
                        # 日付フィールドを探す
                        date_fields = ["releaseDate", "datePublished", "availabilityStarts", "validFrom"]
                        for field in date_fields:
                            if isinstance(data, dict) and field in data:
                                parsed = self.parse_date(data[field])
                                if parsed:
                                    return parsed
                            elif isinstance(data, list):
                                for item in data:
                                    if isinstance(item, dict) and field in item:
                                        parsed = self.parse_date(item[field])
                                        if parsed:
                                            return parsed
                    except json.JSONDecodeError:
                        continue
        except:
            pass

        return None

    def parse_date(self, date_text):
        """様々な形式の日付文字列をパース"""
        if not date_text:
            return None
            
        date_text = date_text.strip()
        
        formats = [
            "%Y-%m-%d",
            "%Y/%m/%d",
            "%m/%d/%Y",
            "%d/%m/%Y",
            "%B %d, %Y",
            "%B %d %Y",
            "%b %d, %Y",
            "%b %d %Y",
            "%d %B %Y",
            "%d %b %Y",
        ]

        for fmt in formats:
            try:
                return datetime.strptime(date_text, fmt).date()
            except ValueError:
                continue

        return None
