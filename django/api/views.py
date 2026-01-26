import logging
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action, throttle_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .throttling import LoginRateThrottle, ToppsCardListThrottle, BurstThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.db.models import F

logger = logging.getLogger(__name__)
from .models import (
    Account, Session, VerificationToken, News, Inquiry, Blog, Contact,
    Team, Player, PlayerStats, ToppsSet, ToppsCard, ToppsCardVariant,
    WBCTournament, WBCGame, WBCRosterEntry
)
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    AccountSerializer, SessionSerializer, VerificationTokenSerializer,
    NewsSerializer, InquirySerializer, BlogSerializer, ContactSerializer,
    LoginSerializer, ToppsCardSerializer, PlayerSerializer, TeamSerializer,
    WBCTournamentListSerializer, WBCTournamentDetailSerializer,
    WBCRosterEntrySerializer
)

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    """
    User login endpoint - returns JWT tokens
    Rate limited to prevent brute force attacks
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    User registration endpoint
    """
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """
    User CRUD operations
    """
    queryset = User.objects.all().prefetch_related('accounts')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        email = self.request.query_params.get('email', None)
        if email:
            return queryset.filter(email=email)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Delete associated accounts first
        instance.accounts.all().delete()
        self.perform_destroy(instance)
        return Response({'message': 'ユーザーが正常に削除されました'}, status=status.HTTP_200_OK)


class AccountViewSet(viewsets.ModelViewSet):
    """
    OAuth Account management
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]


class SessionViewSet(viewsets.ModelViewSet):
    """
    Session management
    """
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]


class VerificationTokenViewSet(viewsets.ModelViewSet):
    """
    Verification Token management
    """
    queryset = VerificationToken.objects.all()
    serializer_class = VerificationTokenSerializer
    permission_classes = [IsAuthenticated]


class NewsViewSet(viewsets.ModelViewSet):
    """
    News CRUD operations
    """
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [IsAuthenticated]


class InquiryViewSet(viewsets.ModelViewSet):
    """
    Inquiry CRUD operations
    """
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer

    def get_permissions(self):
        # Allow anyone to create inquiries
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'お問い合わせが正常に削除されました'}, status=status.HTTP_200_OK)


class ContactViewSet(viewsets.ModelViewSet):
    """
    お問い合わせ管理 - 投稿は誰でも可能、閲覧・管理は管理者のみ
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'message': 'お問い合わせを受け付けました。'},
            status=status.HTTP_201_CREATED
        )


class BlogViewSet(viewsets.ModelViewSet):
    """
    Blog CRUD operations - Only superusers can create/update/delete
    """
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'increment_view']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response(
                {'error': 'superuserのみがブログを投稿できます'},
                status=status.HTTP_403_FORBIDDEN
            )
        # 著者を自動設定
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(author=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response(
                {'error': 'superuserのみがブログを更新できます'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response(
                {'error': 'superuserのみがブログを更新できます'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response(
                {'error': 'superuserのみがブログを削除できます'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def increment_view(self, request, pk=None):
        blog = self.get_object()
        Blog.objects.filter(pk=blog.pk).update(view_count=F('view_count') + 1)
        blog.refresh_from_db()
        return Response({'view_count': blog.view_count})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Get current authenticated user
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Team read-only operations
    """
    queryset = Team.objects.all().order_by('full_name')
    serializer_class = TeamSerializer
    permission_classes = [AllowAny]


class PlayerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Player read-only operations with stats
    """
    queryset = Player.objects.all().select_related('team').prefetch_related('stats')
    serializer_class = PlayerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()

        # フィルタリングオプション
        name = self.request.query_params.get('name', None)
        team_id = self.request.query_params.get('team_id', None)
        has_stats = self.request.query_params.get('has_stats', None)

        if name:
            queryset = queryset.filter(full_name__icontains=name)
        if team_id:
            queryset = queryset.filter(team_id=team_id)
        if has_stats == 'true':
            queryset = queryset.filter(stats__isnull=False).distinct()

        return queryset


class ToppsCardViewSet(viewsets.ModelViewSet):
    """
    Topps NOW card operations - read for all, write for superuser only
    Anti-scraping measures applied
    """
    queryset = ToppsCard.objects.all().select_related(
        'player', 'team', 'topps_set'
    ).order_by('-created_at')
    serializer_class = ToppsCardSerializer
    pagination_class = None  # ページネーションを無効化

    def get_throttles(self):
        """一覧取得にはスクレイピング対策のスロットリングを適用"""
        if self.action == 'list':
            return [ToppsCardListThrottle(), BurstThrottle()]
        return super().get_throttles()

    def get_permissions(self):
        # 読み取り（list, retrieve）は誰でもアクセス可能
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        # 更新・削除はsuperuserのみ
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        """一覧取得時にスクレイピング検出ログを記録"""
        # 不審なアクセスの場合はログを記録
        if getattr(request, 'suspicious_access', False):
            logger.warning(
                f"Suspicious topps-cards access from {self._get_client_ip(request)}"
            )
        return super().list(request, *args, **kwargs)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')

    def update(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response(
                {'error': 'superuserのみがカード情報を更新できます'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response(
                {'error': 'superuserのみがカード情報を更新できます'},
                status=status.HTTP_403_FORBIDDEN
            )
        logger.warning(f"=== PATCH request data: {request.data}")
        instance = self.get_object()
        logger.warning(f"=== Before update - product_url: {instance.product_url}, id: {instance.id}")

        # 直接クエリで更新
        update_fields = {}
        for field in ['product_url', 'product_url_long', 'release_date', 'total_print', 'team_id']:
            if field in request.data:
                update_fields[field] = request.data[field]

        logger.warning(f"=== Update fields: {update_fields}")
        ToppsCard.objects.filter(id=instance.id).update(**update_fields)

        # 再取得
        instance = ToppsCard.objects.get(id=instance.id)
        logger.warning(f"=== After update - product_url: {instance.product_url}")

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response(
                {'error': 'superuserのみがカードを削除できます'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()

        # フィルタリングオプション
        card_number = self.request.query_params.get('card_number', None)
        player_name = self.request.query_params.get('player', None)
        year = self.request.query_params.get('year', None)
        limit = self.request.query_params.get('limit', None)

        if card_number:
            queryset = queryset.filter(card_number=card_number)
        if player_name:
            queryset = queryset.filter(player__full_name__icontains=player_name)
        if year:
            queryset = queryset.filter(topps_set__year=year)
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass

        return queryset


class WBCTournamentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    WBC Tournament read-only operations
    """
    queryset = WBCTournament.objects.all()
    permission_classes = [AllowAny]
    pagination_class = None

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WBCTournamentDetailSerializer
        return WBCTournamentListSerializer

    @action(detail=True, methods=['get'])
    def roster(self, request, pk=None):
        tournament = self.get_object()
        entries = tournament.roster_entries.select_related('player').all()

        country = request.query_params.get('country', None)
        if country:
            entries = entries.filter(country=country)

        serializer = WBCRosterEntrySerializer(entries, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_game_id(request):
    """
    MLB Stats APIからチームの試合IDを取得
    パラメータ:
        - team_id: MLBチームID
        - date: 日付 (YYYY-MM-DD形式)
    """
    try:
        import statsapi
    except ImportError:
        return Response(
            {'error': 'MLB-StatsAPI is not installed'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    team_id = request.query_params.get('team_id')
    date = request.query_params.get('date')

    if not team_id or not date:
        return Response(
            {'error': 'team_id and date are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # 日付フォーマットを変換 (YYYY-MM-DD -> MM/DD/YYYY)
        from datetime import datetime
        date_obj = datetime.strptime(date, '%Y-%m-%d')
        date_formatted = date_obj.strftime('%m/%d/%Y')

        games = statsapi.schedule(date=date_formatted, team=int(team_id))

        if games:
            game = games[0]
            return Response({
                'game_id': game['game_id'],
                'away_team': game['away_name'],
                'home_team': game['home_name'],
                'away_score': game.get('away_score'),
                'home_score': game.get('home_score'),
                'status': game.get('status'),
                'game_url': f"https://www.mlb.com/gameday/{game['game_id']}"
            })
        else:
            return Response(
                {'error': 'No game found', 'game_id': None},
                status=status.HTTP_404_NOT_FOUND
            )

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
