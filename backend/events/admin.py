from django.contrib import admin

from .models import Event, EventAttendee


class EventAttendeeInline(admin.TabularInline):
    model = EventAttendee
    extra = 0
    autocomplete_fields = ('user',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'host',
        'tag',
        'status',
        'starts_at',
        'ends_at',
        'created_at',
    )
    list_filter = ('tag', 'status')
    search_fields = ('title', 'description', 'host__username', 'host__email')
    autocomplete_fields = ('host',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = (EventAttendeeInline,)


@admin.register(EventAttendee)
class EventAttendeeAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'created_at')
    search_fields = ('event__title', 'user__username', 'user__email')
    autocomplete_fields = ('event', 'user')
    readonly_fields = ('created_at', 'updated_at')
