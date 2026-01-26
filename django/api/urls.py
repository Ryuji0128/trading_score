from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet, AccountViewSet, SessionViewSet, VerificationTokenViewSet,
    NewsViewSet, InquiryViewSet, BlogViewSet, ContactViewSet, ToppsCardViewSet,
    PlayerViewSet, TeamViewSet, WBCTournamentViewSet,
    login_view, register_view, current_user_view, get_game_id
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'verification-tokens', VerificationTokenViewSet, basename='verification-token')
router.register(r'news', NewsViewSet, basename='news')
router.register(r'inquiries', InquiryViewSet, basename='inquiry')
router.register(r'blogs', BlogViewSet, basename='blog')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'topps-cards', ToppsCardViewSet, basename='topps-card')
router.register(r'players', PlayerViewSet, basename='player')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'wbc-tournaments', WBCTournamentViewSet, basename='wbc-tournament')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user_view, name='current_user'),

    # MLB API endpoints
    path('mlb/game/', get_game_id, name='get_game_id'),

    # Router URLs
    path('', include(router.urls)),
]
