from django.contrib import admin

from .models import Goal, GoalMember


class GoalMemberInline(admin.TabularInline):
    model = GoalMember
    extra = 0
    autocomplete_fields = ('user',)


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'owner',
        'goal_type',
        'status',
        'progress',
        'stake_points',
        'created_at',
    )
    list_filter = ('goal_type', 'status', 'category')
    search_fields = ('title', 'description', 'owner__username', 'owner__email')
    autocomplete_fields = ('owner',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = (GoalMemberInline,)


@admin.register(GoalMember)
class GoalMemberAdmin(admin.ModelAdmin):
    list_display = ('goal', 'user', 'role', 'created_at')
    list_filter = ('role',)
    search_fields = ('goal__title', 'user__username', 'user__email')
    autocomplete_fields = ('goal', 'user')
    readonly_fields = ('created_at', 'updated_at')
