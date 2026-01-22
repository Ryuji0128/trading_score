from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Account, Session, VerificationToken, News, Inquiry, Blog,
    Team, Player, PlayerStats, ToppsSet, ToppsCard, ToppsCardVariant
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    provider = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'username', 'email', 'email_verified', 'role', 'image', 'is_superuser', 'is_staff', 'created_at', 'updated_at', 'provider']
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_superuser', 'is_staff']

    def get_provider(self, obj):
        account = obj.accounts.first()
        return account.provider if account else None


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['name', 'username', 'email', 'password', 'role']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['name', 'username', 'email', 'password', 'role']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        # If user has OAuth account, don't update name and email
        if instance.accounts.exists():
            validated_data.pop('name', None)
            validated_data.pop('email', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class VerificationTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationToken
        fields = '__all__'


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class BlogSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = Blog
        fields = ['id', 'title', 'content', 'image_url', 'author', 'author_name', 'author_email', 'published', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'author_name', 'author_email']


# JWT Token Serializers
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class TokenSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()


# Topps NOW Serializers
class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'mlb_team_id', 'city', 'nickname', 'full_name', 'abbreviation', 'league', 'division', 'primary_color']


class PlayerStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerStats
        fields = [
            'id', 'season', 'stat_type',
            # 打撃成績
            'games', 'at_bats', 'runs', 'hits', 'doubles', 'triples',
            'home_runs', 'rbi', 'stolen_bases', 'batting_avg', 'obp', 'slg', 'ops',
            # 投球成績
            'wins', 'losses', 'era', 'games_pitched', 'games_started',
            'saves', 'innings_pitched', 'strikeouts', 'walks_allowed', 'whip',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PlayerSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    stats = PlayerStatsSerializer(many=True, read_only=True)

    class Meta:
        model = Player
        fields = ['id', 'full_name', 'first_name', 'last_name', 'team', 'jersey_number', 'position', 'mlb_player_id', 'stats']


class PlayerSimpleSerializer(serializers.ModelSerializer):
    """カード一覧用の軽量シリアライザー（成績を含まない）"""
    class Meta:
        model = Player
        fields = ['id', 'full_name', 'mlb_player_id']


class ToppsSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToppsSet
        fields = ['id', 'year', 'brand', 'name', 'slug']


class ToppsCardSerializer(serializers.ModelSerializer):
    player = PlayerSimpleSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    topps_set = ToppsSetSerializer(read_only=True)

    class Meta:
        model = ToppsCard
        fields = [
            'id', 'topps_set', 'card_number', 'player', 'team',
            'title', 'total_print', 'image_url', 'is_rookie',
            'product_url', 'product_url_long', 'release_date', 'mlb_game_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'player', 'team', 'topps_set', 'card_number']
        # 更新可能フィールド: product_url, product_url_long, release_date, total_print, title, image_url
