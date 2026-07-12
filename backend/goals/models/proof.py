from __future__ import annotations

from django.conf import settings
from django.db import models

from users.models.base import TimestampedModel

from .goal import Goal


class GoalProof(TimestampedModel):
    """A member's evidence that they completed their part of a GROUP goal.

    Solo goals do not use proofs (self-reported status only). One proof per
    member per goal; resubmitting replaces the media and clears prior reviews.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='proofs')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='goal_proofs',
    )
    media = models.FileField(upload_to='proofs/%Y/%m/')
    note = models.TextField(max_length=1000, blank=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
    )

    class Meta:
        db_table = 'goals_goal_proof'
        ordering = ('-created_at',)
        constraints = (
            models.UniqueConstraint(fields=('goal', 'author'), name='uniq_goal_proof_author'),
        )
        indexes = (
            models.Index(fields=('goal', '-created_at'), name='proof_goal_created_idx'),
        )

    def __str__(self) -> str:
        return f'proof:{self.goal_id}:{self.author_id}:{self.status}'


class ProofReview(TimestampedModel):
    class Vote(models.TextChoices):
        APPROVE = 'approve', 'Approve'
        REJECT = 'reject', 'Reject'

    proof = models.ForeignKey(GoalProof, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='proof_reviews',
    )
    vote = models.CharField(max_length=16, choices=Vote.choices)

    class Meta:
        db_table = 'goals_proof_review'
        ordering = ('created_at',)
        constraints = (
            models.UniqueConstraint(fields=('proof', 'reviewer'), name='uniq_proof_reviewer'),
        )

    def __str__(self) -> str:
        return f'review:{self.proof_id}:{self.reviewer_id}:{self.vote}'
