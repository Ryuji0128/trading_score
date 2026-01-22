from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet, AccountViewSet, SessionViewSet, VerificationTokenViewSet,
    NewsViewSet, InquiryViewSet, BlogViewSet,
    login_view, register_view, current_user_view
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'verification-tokens', VerificationTokenViewSet, basename='verification-token')
router.register(r'news', NewsViewSet, basename='news')
router.register(r'inquiries', InquiryViewSet, basename='inquiry')
router.register(r'blogs', BlogViewSet, basename='blog')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user_view, name='current_user'),

    # Router URLs
    path('', include(router.urls)),
]
