from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle
import logging

logger = logging.getLogger('django.security')


class LoginRateThrottle(AnonRateThrottle):
    """
    ログイン試行専用のレート制限
    ブルートフォース攻撃を防止
    """
    scope = 'login'


class ToppsCardListThrottle(SimpleRateThrottle):
    """
    Toppsカード一覧API専用のレート制限
    スクレイピング防止
    """
    scope = 'topps_list'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }

    def throttle_failure(self):
        logger.warning(f"Topps card list rate limit exceeded")
        return False


class BurstThrottle(SimpleRateThrottle):
    """
    短時間での連続リクエストを制限
    スクレイピングボット対策
    """
    scope = 'burst'

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
