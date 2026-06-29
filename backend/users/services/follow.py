from __future__ import annotations

from django.db import transaction
from rest_framework.exceptions import ValidationError

from ..models import Follow, User


@transaction.atomic
def follow_user(*, follower: User, following: User) -> bool:
    """Make ``follower`` follow ``following``. Idempotent.

    Returns ``True`` when a new edge was created, ``False`` if it already
    existed. Raises ``ValidationError`` on self-follow.
    """
    if follower.pk == following.pk:
        raise ValidationError('You cannot follow yourself.')

    _, created = Follow.objects.get_or_create(follower=follower, following=following)
    return created


@transaction.atomic
def unfollow_user(*, follower: User, following: User) -> bool:
    """Remove the ``follower -> following`` edge. Idempotent.

    Returns ``True`` when an edge was removed, ``False`` if none existed.
    """
    deleted, _ = Follow.objects.filter(follower=follower, following=following).delete()
    return deleted > 0
