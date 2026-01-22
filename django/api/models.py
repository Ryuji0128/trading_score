from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    EDITOR = 'EDITOR', 'Editor'
    VIEWER = 'VIEWER', 'Viewer'


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.CharField(primary_key=True, max_length=255, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    username = models.CharField(max_length=255, unique=True, null=True, blank=True)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True)
    email_verified = models.DateTimeField(null=True, blank=True)
    role = models.CharField(
        max_length=10,
        choices=UserRole.choices,
        default=UserRole.VIEWER,
    )
    image = models.CharField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email or self.username or self.id


class Account(models.Model):
    id = models.CharField(primary_key=True, max_length=255, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts', to_field='id', db_column='userId')
    type = models.CharField(max_length=255)
    provider = models.CharField(max_length=255)
    provider_account_id = models.CharField(max_length=255)
    refresh_token = models.TextField(null=True, blank=True)
    access_token = models.TextField(null=True, blank=True)
    expires_at = models.IntegerField(null=True, blank=True)
    token_type = models.CharField(max_length=255, null=True, blank=True)
    scope = models.CharField(max_length=255, null=True, blank=True)
    id_token = models.TextField(null=True, blank=True)
    session_state = models.CharField(max_length=255, null=True, blank=True)
    refresh_token_expires_in = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['provider', 'provider_account_id']]
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.provider} - {self.user.email}"


class Session(models.Model):
    id = models.CharField(primary_key=True, max_length=255, editable=False)
    session_token = models.CharField(max_length=255, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions', db_column='userId')
    expires = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"Session for {self.user.email}"


class VerificationToken(models.Model):
    identifier = models.CharField(max_length=255)
    token = models.CharField(max_length=255)
    expires = models.DateTimeField()

    class Meta:
        unique_together = [['identifier', 'token']]

    def __str__(self):
        return f"{self.identifier} - {self.token}"


class News(models.Model):
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    date = models.DateTimeField()
    title = models.CharField(max_length=255)
    contents = models.JSONField()
    url = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return self.title


class Inquiry(models.Model):
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    inquiry = models.TextField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.email}"


class Blog(models.Model):
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    image_url = models.CharField(max_length=500, null=True, blank=True)
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blogs'
    )
    published = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


# =========================
# MLB Team
# =========================

class League(models.TextChoices):
    AL = "AL", "American League"
    NL = "NL", "National League"


class Division(models.TextChoices):
    EAST = "EAST", "East"
    CENTRAL = "CENTRAL", "Central"
    WEST = "WEST", "West"


class Team(models.Model):
    id = models.AutoField(primary_key=True)
    mlb_team_id = models.IntegerField(null=True, blank=True, unique=True, help_text="MLB公式APIのチームID")

    city = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100)
    full_name = models.CharField(max_length=255)

    abbreviation = models.CharField(max_length=5, unique=True)
    slug = models.SlugField(unique=True)

    league = models.CharField(max_length=2, choices=League.choices)
    division = models.CharField(max_length=10, choices=Division.choices)

    founded_year = models.PositiveIntegerField(null=True, blank=True)
    ballpark = models.CharField(max_length=255, blank=True)

    logo_url = models.CharField(max_length=500, blank=True)
    primary_color = models.CharField(max_length=7, blank=True)

    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["league", "division", "order", "full_name"]

    def __str__(self):
        return self.full_name


# =========================
# Player
# =========================

class BatThrow(models.TextChoices):
    RIGHT = "R", "Right"
    LEFT = "L", "Left"
    SWITCH = "S", "Switch"


class Position(models.TextChoices):
    P = "P", "Pitcher"
    C = "C", "Catcher"
    IF = "IF", "Infielder"
    OF = "OF", "Outfielder"
    DH = "DH", "Designated Hitter"


class Player(models.Model):
    id = models.AutoField(primary_key=True)
    mlb_player_id = models.PositiveIntegerField(
        null=True, blank=True, unique=True,
        help_text="MLB Stats API の選手ID"
    )

    team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="players",
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=255, editable=False)

    jersey_number = models.PositiveIntegerField(null=True, blank=True)

    position = models.CharField(max_length=5, choices=Position.choices)

    bats = models.CharField(max_length=1, choices=BatThrow.choices, blank=True)
    throws = models.CharField(max_length=1, choices=BatThrow.choices, blank=True)

    birth_date = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)

    image_url = models.CharField(max_length=500, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["team", "position", "jersey_number", "last_name"]

    def save(self, *args, **kwargs):
        self.full_name = f"{self.first_name} {self.last_name}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name


# =========================
# Player Stats
# =========================

class StatType(models.TextChoices):
    HITTING = "hitting", "Hitting"
    PITCHING = "pitching", "Pitching"


class PlayerStats(models.Model):
    id = models.AutoField(primary_key=True)

    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="stats"
    )
    season = models.PositiveIntegerField(help_text="シーズン年")
    stat_type = models.CharField(
        max_length=10,
        choices=StatType.choices,
        help_text="成績タイプ（打撃/投球）"
    )

    # 打撃成績
    games = models.PositiveIntegerField(null=True, blank=True, help_text="試合数")
    at_bats = models.PositiveIntegerField(null=True, blank=True, help_text="打数")
    runs = models.PositiveIntegerField(null=True, blank=True, help_text="得点")
    hits = models.PositiveIntegerField(null=True, blank=True, help_text="安打数")
    doubles = models.PositiveIntegerField(null=True, blank=True, help_text="二塁打")
    triples = models.PositiveIntegerField(null=True, blank=True, help_text="三塁打")
    home_runs = models.PositiveIntegerField(null=True, blank=True, help_text="本塁打")
    rbi = models.PositiveIntegerField(null=True, blank=True, help_text="打点")
    stolen_bases = models.PositiveIntegerField(null=True, blank=True, help_text="盗塁")
    batting_avg = models.DecimalField(
        max_digits=4, decimal_places=3, null=True, blank=True,
        help_text="打率"
    )
    obp = models.DecimalField(
        max_digits=4, decimal_places=3, null=True, blank=True,
        help_text="出塁率"
    )
    slg = models.DecimalField(
        max_digits=4, decimal_places=3, null=True, blank=True,
        help_text="長打率"
    )
    ops = models.DecimalField(
        max_digits=4, decimal_places=3, null=True, blank=True,
        help_text="OPS"
    )

    # 投球成績
    wins = models.PositiveIntegerField(null=True, blank=True, help_text="勝利")
    losses = models.PositiveIntegerField(null=True, blank=True, help_text="敗北")
    era = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="防御率"
    )
    games_pitched = models.PositiveIntegerField(null=True, blank=True, help_text="登板試合数")
    games_started = models.PositiveIntegerField(null=True, blank=True, help_text="先発試合数")
    saves = models.PositiveIntegerField(null=True, blank=True, help_text="セーブ")
    innings_pitched = models.DecimalField(
        max_digits=5, decimal_places=1, null=True, blank=True,
        help_text="投球回"
    )
    strikeouts = models.PositiveIntegerField(null=True, blank=True, help_text="奪三振")
    walks_allowed = models.PositiveIntegerField(null=True, blank=True, help_text="与四球")
    whip = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        help_text="WHIP"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["player", "season", "stat_type"]]
        ordering = ["-season", "stat_type"]
        indexes = [
            models.Index(fields=["season"]),
            models.Index(fields=["stat_type"]),
        ]

    def __str__(self):
        return f"{self.player.full_name} {self.season} {self.stat_type}"


# =========================
# Topps Cards
# =========================

class ToppsSet(models.Model):
    id = models.AutoField(primary_key=True)

    year = models.PositiveIntegerField()
    brand = models.CharField(max_length=100, default="Topps")
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    release_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["year", "name"]]
        ordering = ["-year", "name"]

    def __str__(self):
        return f"{self.year} {self.name}"


class ToppsCard(models.Model):
    id = models.AutoField(primary_key=True)

    topps_set = models.ForeignKey(ToppsSet, on_delete=models.CASCADE, related_name="cards")
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="topps_cards")
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    total_print = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="総発行枚数（不明の場合はnull）"
    )

    card_number = models.CharField(max_length=20)
    title = models.CharField(max_length=255, blank=True)
    is_rookie = models.BooleanField(default=False)
    image_url = models.CharField(max_length=500, blank=True)
    product_url = models.CharField(max_length=500, blank=True, help_text="Topps公式商品ページURL（短い形式）")
    product_url_long = models.CharField(max_length=500, blank=True, help_text="Topps公式商品ページURL（長い形式）")
    release_date = models.DateField(null=True, blank=True, help_text="カード発行日")
    mlb_game_id = models.PositiveIntegerField(null=True, blank=True, help_text="MLB Game ID（試合日のgameday ID）")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["topps_set", "card_number"]]
        ordering = ["topps_set", "card_number"]

    def generate_product_urls(self):
        """タイトルから2種類のTopps公式商品ページURLを生成する"""
        if not self.title:
            return "", ""

        import re
        import urllib.parse

        def make_slug(text):
            slug = text.lower()
            slug = re.sub(r'\s*/\s*', '-', slug)
            slug = re.sub(r'\s*-\s*', '-', slug)
            slug = re.sub(r'\s+', '-', slug)
            slug = re.sub(r'-+', '-', slug)
            slug = slug.strip('-')
            return urllib.parse.quote(slug, safe='-')

        # 短いURL: "Card XXX" の後を全て削除
        short_title = re.sub(r'(Card\s+[\w-]+).*', r'\1', self.title, flags=re.IGNORECASE | re.DOTALL)
        short_slug = make_slug(short_title)
        short_url = f"https://www.topps.com/products/{short_slug}"

        # 長いURL: "PR: XXX" と改行以降を削除（LOOK FORは残す）
        # まず改行を削除
        single_line = self.title.replace('\n', ' ').replace('\r', ' ')
        # PR: 以降を削除
        long_title = re.sub(r'\s*-\s*PR:\s*[\d,]+.*$', '', single_line, flags=re.IGNORECASE)
        long_slug = make_slug(long_title)
        long_url = f"https://www.topps.com/products/{long_slug}"

        return short_url, long_url

    def save(self, *args, **kwargs):
        # 保存時にproduct_urlが空の場合は自動生成
        if not self.product_url and self.title:
            short_url, long_url = self.generate_product_urls()
            self.product_url = short_url
            self.product_url_long = long_url
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.topps_set} #{self.card_number} {self.player.full_name}"


class CardVariantType(models.TextChoices):
    BASE = "BASE", "Base"
    PARALLEL = "PARALLEL", "Parallel"
    AUTO = "AUTO", "Autograph"
    RELIC = "RELIC", "Relic"
    AUTO_RELIC = "AUTO_RELIC", "Auto Relic"


class ToppsCardVariant(models.Model):
    id = models.AutoField(primary_key=True)

    card = models.ForeignKey(ToppsCard, on_delete=models.CASCADE, related_name="variants")

    variant_type = models.CharField(max_length=20, choices=CardVariantType.choices)
    variant_name = models.CharField(max_length=100, blank=True)

    serial_number = models.PositiveIntegerField(null=True, blank=True)
    is_one_of_one = models.BooleanField(default=False)

    image_url = models.CharField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["variant_type", "serial_number"]
        indexes = [
            models.Index(fields=["variant_type"]),
            models.Index(fields=["serial_number"]),
        ]

    def save(self, *args, **kwargs):
        if self.is_one_of_one:
            self.serial_number = 1
        super().save(*args, **kwargs)

    def __str__(self):
        base = f"{self.card}"
        return f"{base} /{self.serial_number}" if self.serial_number else base
