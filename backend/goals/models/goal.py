from __future__ import annotations

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q

from users.models.base import TimestampedModel


class Goal(TimestampedModel):
    class GoalType(models.TextChoices):
        SOLO = 'solo', 'Solo'
        GROUP = 'group', 'Group'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        PAUSED = 'paused', 'Paused'
        ARCHIVED = 'archived', 'Archived'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_goals',
    )
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=80, blank=True)
    goal_type = models.CharField(
        max_length=16,
        choices=GoalType.choices,
        default=GoalType.SOLO,
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    progress = models.PositiveSmallIntegerField(
        default=0,
        validators=(MinValueValidator(0), MaxValueValidator(100)),
    )
    stake_points = models.PositiveIntegerField(default=0)
    schedule_label = models.CharField(max_length=160, blank=True)
    cover_color = models.CharField(max_length=40, blank=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    due_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'goals_goal'
        ordering = ('-created_at',)
        indexes = (
            models.Index(fields=('owner', 'status'), name='goals_owner_status_idx'),
            models.Index(fields=('category',), name='goals_category_idx'),
        )

    def __str__(self) -> str:
        return self.title


class GoalMember(TimestampedModel):
    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        ADMIN = 'admin', 'Admin'
        MEMBER = 'member', 'Member'

    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name='memberships',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='goal_memberships',
    )
    role = models.CharField(
        max_length=16,
        choices=Role.choices,
        default=Role.MEMBER,
    )

    class Meta:
        db_table = 'goals_goal_member'
        ordering = ('created_at',)
        constraints = (
            models.UniqueConstraint(
                fields=('goal', 'user'),
                name='uniq_goal_member',
            ),
            models.CheckConstraint(
                condition=Q(role__in=('owner', 'admin', 'member')),
                name='valid_goal_member_role',
            ),
        )
        indexes = (
            models.Index(fields=('user', 'role'), name='goal_member_user_role_idx'),
        )

    def __str__(self) -> str:
        return f'{self.goal_id}:{self.user_id}:{self.role}'
