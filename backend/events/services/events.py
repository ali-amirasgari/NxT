from __future__ import annotations

from django.db import transaction

from ..models import Event, EventAttendee


@transaction.atomic
def rsvp_event(*, user, event: Event) -> bool:
    """User RSVPs to an event. Idempotent.

    Returns ``True`` when a new RSVP was created, ``False`` if it already existed.
    """
    _, created = EventAttendee.objects.get_or_create(event=event, user=user)
    return created


@transaction.atomic
def unrsvp_event(*, user, event: Event) -> bool:
    """Remove a user's RSVP. Idempotent.

    Returns ``True`` when an RSVP was removed, ``False`` if none existed.
    """
    deleted, _ = EventAttendee.objects.filter(event=event, user=user).delete()
    return deleted > 0
