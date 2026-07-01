from __future__ import annotations

from django.conf import settings
from django.db import models

from users.models.base import TimestampedModel


class Event(TimestampedModel):
    class Tag(models.TextChoices):
        WORKSHOP = 'workshop', 'Workshop'
        CHALLENGE = 'challenge', 'Challenge'
        MEETING = 'meeting', 'Meeting'
        OTHER = 'other', 'Other'

    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        CANCELLED = 'cancelled', 'Cancelled'
        COMPLETED = 'completed', 'Completed'

    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hosted_events',
    )
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    tag = models.CharField(
        max_length=16,
        choices=Tag.choices,
        default=Tag.OTHER,
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.SCHEDULED,
    )
    cover_color = models.CharField(max_length=40, blank=True)
    cover_image = models.URLField(max_length=500, blank=True)
    location = models.CharField(max_length=160, blank=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'events_event'
        ordering = ('starts_at',)
        indexes = (
            models.Index(fields=('status', 'starts_at'), name='events_status_starts_idx'),
            models.Index(fields=('host',), name='events_host_idx'),
        )

    def __str__(self) -> str:
        return self.title


class EventAttendee(TimestampedModel):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='attendees',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='event_rsvps',
    )

    class Meta:
        db_table = 'events_event_attendee'
        ordering = ('created_at',)
        constraints = (
            models.UniqueConstraint(
                fields=('event', 'user'),
                name='uniq_event_attendee',
            ),
        )

    def __str__(self) -> str:
        return f'{self.event_id}:{self.user_id}'
