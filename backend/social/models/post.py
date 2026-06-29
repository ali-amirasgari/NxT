from __future__ import annotations

from django.conf import settings
from django.db import models

from goals.models import Goal
from users.models.base import TimestampedModel


class Post(TimestampedModel):
    class MediaType(models.TextChoices):
        IMAGE = 'image', 'Image'
        VIDEO = 'video', 'Video'
        NONE = 'none', 'None'

    class MediaTone(models.TextChoices):
        PRIMARY = 'primary', 'Primary'
        SECONDARY = 'secondary', 'Secondary'
        MUTED = 'muted', 'Muted'
        CARD = 'card', 'Card'

    class Visibility(models.TextChoices):
        PUBLIC = 'public', 'Public'
        FOLLOWERS = 'followers', 'Followers'
        PRIVATE = 'private', 'Private'

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
    )
    goal = models.ForeignKey(
        Goal,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts',
    )
    title = models.CharField(max_length=160)
    caption = models.TextField(blank=True)
    media_url = models.URLField(max_length=500, blank=True)
    media_type = models.CharField(
        max_length=16,
        choices=MediaType.choices,
        default=MediaType.NONE,
    )
    media_tone = models.CharField(
        max_length=16,
        choices=MediaTone.choices,
        default=MediaTone.PRIMARY,
    )
    visibility = models.CharField(
        max_length=16,
        choices=Visibility.choices,
        default=Visibility.PUBLIC,
    )

    class Meta:
        db_table = 'social_post'
        ordering = ('-created_at',)
        indexes = (
            models.Index(fields=('author', '-created_at'), name='post_author_created_idx'),
            models.Index(fields=('goal', '-created_at'), name='post_goal_created_idx'),
            models.Index(fields=('visibility', '-created_at'), name='post_visibility_idx'),
        )

    def __str__(self) -> str:
        return self.title


class Comment(TimestampedModel):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
    )
    body = models.TextField(max_length=1000)

    class Meta:
        db_table = 'social_comment'
        ordering = ('created_at',)
        indexes = (
            models.Index(fields=('post', 'created_at'), name='comment_post_created_idx'),
            models.Index(fields=('author', '-created_at'), name='comment_author_created_idx'),
        )

    def __str__(self) -> str:
        return self.body[:80]


class PostLike(TimestampedModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_likes')

    class Meta:
        db_table = 'social_post_like'
        constraints = (
            models.UniqueConstraint(fields=('post', 'user'), name='uniq_post_like'),
        )


class CommentLike(TimestampedModel):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comment_likes')

    class Meta:
        db_table = 'social_comment_like'
        constraints = (
            models.UniqueConstraint(fields=('comment', 'user'), name='uniq_comment_like'),
        )


class PostSave(TimestampedModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saves')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_saves')

    class Meta:
        db_table = 'social_post_save'
        constraints = (
            models.UniqueConstraint(fields=('post', 'user'), name='uniq_post_save'),
        )


class PostShare(TimestampedModel):
    class Channel(models.TextChoices):
        COPY = 'copy', 'Copy'
        DIRECT = 'direct', 'Direct'

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_shares')
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_post_shares',
    )
    channel = models.CharField(max_length=16, choices=Channel.choices, default=Channel.COPY)

    class Meta:
        db_table = 'social_post_share'
        indexes = (
            models.Index(fields=('post', '-created_at'), name='share_post_created_idx'),
            models.Index(fields=('user', '-created_at'), name='share_user_created_idx'),
        )
