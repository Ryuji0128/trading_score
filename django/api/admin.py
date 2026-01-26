from django.contrib import admin
from .models import (
    User, Account, Session, VerificationToken, News, Inquiry, Blog, Contact,
    Team, Player, ToppsSet, ToppsCard, ToppsCardVariant
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('email', 'name', 'username')
    ordering = ('-created_at',)


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'provider', 'provider_account_id', 'created_at')
    list_filter = ('provider',)
    search_fields = ('user__email', 'provider')


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'session_token', 'expires', 'created_at')
    search_fields = ('user__email', 'session_token')


@admin.register(VerificationToken)
class VerificationTokenAdmin(admin.ModelAdmin):
    list_display = ('identifier', 'token', 'expires')
    search_fields = ('identifier',)


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'created_at')
    search_fields = ('title',)
    ordering = ('-date',)


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'created_at')
    search_fields = ('name', 'email')
    ordering = ('-created_at',)


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'email', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    ordering = ('-created_at',)
    readonly_fields = ('name', 'email', 'subject', 'message', 'created_at', 'updated_at')
    fieldsets = (
        ('お問い合わせ内容', {
            'fields': ('name', 'email', 'subject', 'message', 'created_at')
        }),
        ('対応状況', {
            'fields': ('status', 'admin_notes', 'updated_at')
        }),
    )

    def has_add_permission(self, request):
        # 管理画面からの追加は不可（フロントからのみ受付）
        return False


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'content')
    ordering = ('-created_at',)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('abbreviation', 'full_name', 'league', 'division', 'is_active', 'order')
    list_filter = ('league', 'division', 'is_active')
    search_fields = ('full_name', 'city', 'nickname', 'abbreviation')
    ordering = ('league', 'division', 'order', 'full_name')
    prepopulated_fields = {'slug': ('full_name',)}


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'team', 'jersey_number', 'position', 'bats', 'throws', 'is_active')
    list_filter = ('team', 'position', 'is_active', 'bats', 'throws')
    search_fields = ('full_name', 'first_name', 'last_name')
    ordering = ('team', 'position', 'jersey_number', 'last_name')


@admin.register(ToppsSet)
class ToppsSetAdmin(admin.ModelAdmin):
    list_display = ('year', 'brand', 'name', 'release_date')
    list_filter = ('year', 'brand')
    search_fields = ('name', 'brand')
    ordering = ('-year', 'name')
    prepopulated_fields = {'slug': ('name',)}


class ToppsCardVariantInline(admin.TabularInline):
    model = ToppsCardVariant
    extra = 0
    fields = ('variant_type', 'variant_name', 'serial_number', 'is_one_of_one')


@admin.register(ToppsCard)
class ToppsCardAdmin(admin.ModelAdmin):
    list_display = ('card_number', 'topps_set', 'player', 'team', 'is_rookie')
    list_filter = ('topps_set', 'is_rookie', 'team')
    search_fields = ('card_number', 'player__full_name', 'title')
    ordering = ('topps_set', 'card_number')
    inlines = [ToppsCardVariantInline]


@admin.register(ToppsCardVariant)
class ToppsCardVariantAdmin(admin.ModelAdmin):
    list_display = ('card', 'variant_type', 'variant_name', 'serial_number', 'is_one_of_one')
    list_filter = ('variant_type', 'is_one_of_one')
    search_fields = ('card__card_number', 'card__player__full_name', 'variant_name')
    ordering = ('card', 'variant_type', 'serial_number')
