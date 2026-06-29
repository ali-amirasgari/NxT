from __future__ import annotations

from django.contrib.auth.models import AbstractUser, UserManager as DjangoUserManager
from django.db import models
from django.db.models import Count, Exists, OuterRef, Value

from .base import TimestampedModel
from .follow import Follow


class UserQuerySet(models.QuerySet):
    def with_follow_counts(self) -> 'UserQuerySet':
        """Annotate ``followers_count`` / ``following_count`` in one query
        (no per-row count queries — kills the N+1)."""
        return self.annotate(
            followers_count=Count('follower_links', distinct=True),
            following_count=Count('following_links', distinct=True),
        )

    def with_viewer_state(self, viewer) -> 'UserQuerySet':
        """Annotate the relationship between ``viewer`` and each row:
        ``is_following`` (viewer -> row) and ``is_followed_by`` (row -> viewer)."""
        if viewer is None or not getattr(viewer, 'is_authenticated', False):
            return self.annotate(
                is_following=Value(False, output_field=models.BooleanField()),
                is_followed_by=Value(False, output_field=models.BooleanField()),
            )

        return self.annotate(
            is_following=Exists(
                Follow.objects.filter(follower=viewer, following=OuterRef('pk'))
            ),
            is_followed_by=Exists(
                Follow.objects.filter(follower=OuterRef('pk'), following=viewer)
            ),
        )


class UserManager(DjangoUserManager.from_queryset(UserQuerySet)):
    """Keeps ``create_user`` / ``create_superuser`` while exposing the
    annotation helpers above on ``User.objects``."""


class User(AbstractUser, TimestampedModel):
    """
    Project user model. Username stays the login identifier (email is mirrored
    into it at registration), ``email`` is unique, and the profile carries the
    social fields the frontend renders/edits.
    """

    email = models.EmailField('email address', unique=True)

    # Public profile
    display_name = models.CharField(max_length=150, blank=True)
    bio = models.CharField(max_length=160, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    location = models.CharField(max_length=120, blank=True)
    website = models.URLField(max_length=200, blank=True)
    instagram_url = models.URLField(max_length=200, blank=True)
    telegram_url = models.URLField(max_length=200, blank=True)

    # Settings
    is_private = models.BooleanField(default=False)
    notifications_enabled = models.BooleanField(default=True)

    objects = UserManager()

    class Meta:
        db_table = 'users_user'
        ordering = ('username',)
        indexes = (
            models.Index(fields=('display_name',), name='users_user_disp_name_idx'),
        )

    def __str__(self) -> str:
        return self.get_username()

    @property
    def resolved_display_name(self) -> str:
        return self.display_name or self.get_full_name() or self.get_username()
