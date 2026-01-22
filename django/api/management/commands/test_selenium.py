"""
Selenium環境のテストコマンド
Chrome/ChromeDriverが正しくインストールされているか確認
"""
from django.core.management.base import BaseCommand

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
except ImportError:
    webdriver = None


class Command(BaseCommand):
    help = 'Test Selenium/Chrome installation'

    def handle(self, *args, **options):
        if not webdriver:
            self.stdout.write(
                self.style.ERROR('Selenium not installed. Run: pip install selenium')
            )
            return

        self.stdout.write('Testing Selenium WebDriver...\n')

        # Chrome設定
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.binary_location = '/usr/bin/chromium'

        driver = None

        try:
            self.stdout.write('1. Initializing Chrome WebDriver...')
            driver = webdriver.Chrome(options=chrome_options)
            self.stdout.write(self.style.SUCCESS('   ✓ WebDriver initialized'))

            self.stdout.write('\n2. Loading test page (example.com)...')
            driver.get('https://example.com')
            self.stdout.write(self.style.SUCCESS('   ✓ Page loaded'))

            self.stdout.write('\n3. Getting page title...')
            title = driver.title
            self.stdout.write(f'   Page title: {title}')

            self.stdout.write('\n4. Finding elements...')
            h1 = driver.find_element(By.TAG_NAME, 'h1')
            self.stdout.write(f'   H1 text: {h1.text}')

            self.stdout.write('\n5. Getting page source length...')
            page_source = driver.page_source
            self.stdout.write(f'   Page source: {len(page_source)} characters')

            self.stdout.write('\n6. Taking screenshot...')
            screenshot_path = '/tmp/selenium_test.png'
            driver.save_screenshot(screenshot_path)
            self.stdout.write(f'   Screenshot saved to: {screenshot_path}')

            self.stdout.write(self.style.SUCCESS('\n✓ All tests passed!'))
            self.stdout.write('Selenium is working correctly.')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n✗ Test failed: {e}'))
            import traceback
            self.stdout.write(traceback.format_exc())

        finally:
            if driver:
                self.stdout.write('\nClosing browser...')
                driver.quit()
                self.stdout.write('Done.')
