from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ('username', 'email', 'display_name', 'is_staff', 'is_active', 'created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'is_private')
    search_fields = ('username', 'email', 'display_name')
    ordering = ('username',)
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined')

    fieldsets = DjangoUserAdmin.fieldsets + (
        ('Profile', {
            'fields': (
                'display_name',
                'bio',
                'avatar_url',
                'location',
                'website',
                'instagram_url',
                'telegram_url',
                'is_private',
                'notifications_enabled',
            ),
        }),
        ('Audit', {'fields': ('created_at', 'updated_at')}),
    )
