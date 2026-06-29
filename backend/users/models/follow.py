from __future__ import annotations

from django.conf import settings
from django.db import models
from django.db.models import Q

from .base import TimestampedModel


class Follow(TimestampedModel):
    """Directed follow edge: ``follower`` follows ``following``."""

    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following_links',
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='follower_links',
    )

    class Meta:
        db_table = 'users_follow'
        ordering = ('-created_at',)
        constraints = (
            models.UniqueConstraint(
                fields=('follower', 'following'),
                name='uniq_follow_pair',
            ),
            models.CheckConstraint(
                condition=~Q(follower=models.F('following')),
                name='prevent_self_follow',
            ),
        )
        indexes = (
            models.Index(fields=('following', 'follower'), name='follow_following_idx'),
        )

    def __str__(self) -> str:
        return f'{self.follower_id} -> {self.following_id}'
