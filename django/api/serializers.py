from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Account, Session, VerificationToken, News, Inquiry, Blog, Contact,
    Team, Player, PlayerStats, ToppsSet, ToppsCard, ToppsCardVariant,
    WBCTournament, WBCGame, WBCRosterEntry
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


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'subject', 'message', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']


class BlogSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = Blog
        fields = ['id', 'title', 'content', 'image_url', 'author', 'author_name', 'author_email', 'published', 'view_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'author_name', 'author_email', 'view_count']


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
        fields = ['id', 'full_name', 'mlb_player_id', 'nationality', 'wbc_years', 'wbc_country']


class ToppsSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToppsSet
        fields = ['id', 'year', 'brand', 'name', 'slug']


# WBC Serializers
class WBCGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = WBCGame
        fields = ['id', 'game_pk', 'game_date', 'away_team', 'home_team', 'away_score', 'home_score', 'status']


class WBCRosterEntrySerializer(serializers.ModelSerializer):
    has_topps_card = serializers.SerializerMethodField()

    class Meta:
        model = WBCRosterEntry
        fields = ['id', 'country', 'mlb_player_id', 'player_name', 'player', 'has_topps_card']

    def get_has_topps_card(self, obj):
        if obj.player:
            return obj.player.topps_cards.exists()
        return False


class WBCTournamentListSerializer(serializers.ModelSerializer):
    game_count = serializers.SerializerMethodField()
    country_count = serializers.SerializerMethodField()

    class Meta:
        model = WBCTournament
        fields = ['id', 'year', 'champion', 'runner_up', 'game_count', 'country_count']

    def get_game_count(self, obj):
        return obj.games.count()

    def get_country_count(self, obj):
        return obj.roster_entries.values('country').distinct().count()


class WBCTournamentDetailSerializer(serializers.ModelSerializer):
    games = WBCGameSerializer(many=True, read_only=True)

    class Meta:
        model = WBCTournament
        fields = ['id', 'year', 'champion', 'runner_up', 'games']


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
