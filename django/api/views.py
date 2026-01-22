from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .models import (
    Account, Session, VerificationToken, News, Inquiry, Blog,
    Team, Player, ToppsSet, ToppsCard, ToppsCardVariant
)
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    AccountSerializer, SessionSerializer, VerificationTokenSerializer,
    NewsSerializer, InquirySerializer, BlogSerializer,
    LoginSerializer, ToppsCardSerializer
)

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User login endpoint - returns JWT tokens
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


class BlogViewSet(viewsets.ModelViewSet):
    """
    Blog CRUD operations
    """
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Get current authenticated user
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class ToppsCardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Topps NOW card read-only operations
    """
    queryset = ToppsCard.objects.all().select_related(
        'player', 'team', 'topps_set'
    ).order_by('-created_at')
    serializer_class = ToppsCardSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # ページネーションを無効化

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
