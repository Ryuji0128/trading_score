import logging
import re
from django.http import HttpResponseForbidden

logger = logging.getLogger('django.security')

# 既知のボット/スクレイパーのUser-Agentパターン
BOT_PATTERNS = [
    r'scrapy',
    r'python-requests',
    r'python-urllib',
    r'curl/',
    r'wget/',
    r'httpie',
    r'PostmanRuntime',
    r'Java/',
    r'Go-http-client',
    r'libwww-perl',
    r'Mechanize',
    r'PhantomJS',
    r'HeadlessChrome',
    r'selenium',
    r'puppeteer',
    r'playwright',
]

# 許可するボット（検索エンジン等）
ALLOWED_BOTS = [
    r'Googlebot',
    r'Bingbot',
    r'Slurp',  # Yahoo
    r'DuckDuckBot',
]


class AntiScrapingMiddleware:
    """
    スクレイピングボットを検出してブロック
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.bot_regex = re.compile('|'.join(BOT_PATTERNS), re.IGNORECASE)
        self.allowed_bot_regex = re.compile('|'.join(ALLOWED_BOTS), re.IGNORECASE)

    def __call__(self, request):
        # APIエンドポイントのみチェック
        if request.path.startswith('/api/'):
            user_agent = request.META.get('HTTP_USER_AGENT', '')

            # User-Agentが空の場合は拒否
            if not user_agent:
                logger.warning(f"Request blocked: No User-Agent from {self._get_client_ip(request)}")
                return HttpResponseForbidden('Access denied')

            # 許可されたボット（検索エンジン）はスキップ
            if self.allowed_bot_regex.search(user_agent):
                return self.get_response(request)

            # 既知のスクレイパーパターンをチェック
            if self.bot_regex.search(user_agent):
                logger.warning(
                    f"Scraper blocked: {user_agent[:100]} from {self._get_client_ip(request)}"
                )
                return HttpResponseForbidden('Access denied')

        return self.get_response(request)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')


class ReferrerCheckMiddleware:
    """
    Refererヘッダーをチェックして不正なアクセスをブロック
    (直接APIにアクセスするスクレイパー対策)
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # topps-cards APIのみRefererチェック
        if '/api/topps-cards/' in request.path and request.method == 'GET':
            referer = request.META.get('HTTP_REFERER', '')

            # 内部リクエスト（サーバーサイドレンダリング）は許可
            if self._is_internal_request(request):
                return self.get_response(request)

            # Refererがない or 外部からの直接アクセスは制限
            # ただし認証済みユーザーは許可
            if not request.user.is_authenticated:
                if not referer or not self._is_valid_referer(referer):
                    logger.info(
                        f"Suspicious API access without valid referer: {self._get_client_ip(request)}"
                    )
                    # 完全にブロックせず、レート制限を厳しくする目印をつける
                    request.suspicious_access = True

        return self.get_response(request)

    def _is_internal_request(self, request):
        """内部リクエスト（Next.jsサーバーサイド）かチェック"""
        remote_addr = request.META.get('REMOTE_ADDR', '')
        # Docker内部ネットワークからのアクセス
        return remote_addr.startswith('172.') or remote_addr == '127.0.0.1'

    def _is_valid_referer(self, referer):
        """許可されたRefererかチェック"""
        allowed_domains = [
            'localhost',
            '127.0.0.1',
            'baseball-now.com',
            'www.baseball-now.com',
        ]
        return any(domain in referer for domain in allowed_domains)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')
