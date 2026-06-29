from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from users.models.base import TimestampedModel


class Wallet(TimestampedModel):
    class Kind(models.TextChoices):
        MONEY = 'money', 'Money'
        POINTS = 'points', 'Points'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        FROZEN = 'frozen', 'Frozen'
        CLOSED = 'closed', 'Closed'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallets',
    )
    kind = models.CharField(max_length=16, choices=Kind.choices)
    currency = models.CharField(max_length=12, blank=True, default='')
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    available_balance = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=(MinValueValidator(Decimal('0.00')),)
    )
    held_balance = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=(MinValueValidator(Decimal('0.00')),)
    )

    class Meta:
        db_table = 'wallet_wallet'
        ordering = ('kind', 'currency')
        constraints = (
            models.UniqueConstraint(
                fields=('user', 'kind', 'currency'),
                name='uniq_user_wallet_kind_currency',
            ),
            models.CheckConstraint(
                condition=models.Q(available_balance__gte=0),
                name='wallet_available_non_negative',
            ),
            models.CheckConstraint(
                condition=models.Q(held_balance__gte=0),
                name='wallet_held_non_negative',
            ),
        )
        indexes = (
            models.Index(fields=('user', 'kind'), name='wallet_user_kind_idx'),
        )

    def __str__(self) -> str:
        label = self.currency or self.kind
        return f'{self.user_id}:{self.kind}:{label}'


class WalletLedgerEntry(TimestampedModel):
    class EntryType(models.TextChoices):
        CREDIT = 'credit', 'Credit'
        DEBIT = 'debit', 'Debit'
        HOLD = 'hold', 'Hold'
        RELEASE = 'release', 'Release'
        CAPTURE = 'capture', 'Capture'
        ADJUSTMENT = 'adjustment', 'Adjustment'

    class Reason(models.TextChoices):
        ADMIN_ADJUSTMENT = 'admin_adjustment', 'Admin adjustment'
        GOAL_STAKE_HOLD = 'goal_stake_hold', 'Goal stake hold'
        GOAL_STAKE_RELEASE = 'goal_stake_release', 'Goal stake release'
        GOAL_STAKE_CAPTURE = 'goal_stake_capture', 'Goal stake capture'
        REWARD = 'reward', 'Reward'
        REFUND = 'refund', 'Refund'

    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='ledger_entries',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet_ledger_entries',
    )
    entry_type = models.CharField(max_length=16, choices=EntryType.choices)
    amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=(MinValueValidator(Decimal('0.01')),)
    )
    balance_after = models.DecimalField(max_digits=18, decimal_places=2)
    held_balance_after = models.DecimalField(max_digits=18, decimal_places=2)
    reason = models.CharField(max_length=40, choices=Reason.choices)
    reference_type = models.CharField(max_length=80, blank=True)
    reference_id = models.PositiveBigIntegerField(null=True, blank=True)
    idempotency_key = models.CharField(max_length=160, unique=True, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'wallet_ledger_entry'
        ordering = ('-created_at',)
        constraints = (
            models.CheckConstraint(
                condition=models.Q(amount__gt=0),
                name='wallet_ledger_amount_positive',
            ),
        )
        indexes = (
            models.Index(fields=('wallet', '-created_at'), name='ledger_wallet_created_idx'),
            models.Index(fields=('user', '-created_at'), name='ledger_user_created_idx'),
            models.Index(fields=('reference_type', 'reference_id'), name='ledger_reference_idx'),
        )

    def __str__(self) -> str:
        return f'{self.wallet_id}:{self.entry_type}:{self.amount}'
