from __future__ import annotations

from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db import transaction
from rest_framework import exceptions

from wallet.models import Wallet, WalletLedgerEntry

DEFAULT_MONEY_CURRENCY = getattr(settings, 'WALLET_DEFAULT_MONEY_CURRENCY', 'USD')


def normalize_amount(amount) -> Decimal:
    try:
        normalized = Decimal(str(amount)).quantize(Decimal('0.01'))
    except (InvalidOperation, ValueError):
        raise exceptions.ValidationError({'amount': 'Enter a valid amount.'})
    if normalized <= 0:
        raise exceptions.ValidationError({'amount': 'Amount must be greater than zero.'})
    return normalized


def wallet_currency_for(kind: str, currency: str = '') -> str:
    return DEFAULT_MONEY_CURRENCY if kind == Wallet.Kind.MONEY and not currency else currency


def get_or_create_wallet(user, kind: str, currency: str = '') -> Wallet:
    currency = wallet_currency_for(kind, currency)
    wallet, _ = Wallet.objects.get_or_create(
        user=user,
        kind=kind,
        currency=currency,
        defaults={'status': Wallet.Status.ACTIVE},
    )
    return wallet


def ensure_default_wallets(user) -> list[Wallet]:
    return [
        get_or_create_wallet(user, Wallet.Kind.POINTS, ''),
        get_or_create_wallet(user, Wallet.Kind.MONEY, DEFAULT_MONEY_CURRENCY),
    ]


def _existing_entry(idempotency_key):
    if not idempotency_key:
        return None
    return WalletLedgerEntry.objects.filter(idempotency_key=idempotency_key).first()


def _ledger_entry(
    *,
    wallet: Wallet,
    entry_type: str,
    amount: Decimal,
    reason: str,
    reference_type: str = '',
    reference_id=None,
    idempotency_key: str | None = None,
    metadata: dict | None = None,
) -> WalletLedgerEntry:
    return WalletLedgerEntry.objects.create(
        wallet=wallet,
        user=wallet.user,
        entry_type=entry_type,
        amount=amount,
        balance_after=wallet.available_balance,
        held_balance_after=wallet.held_balance,
        reason=reason,
        reference_type=reference_type,
        reference_id=reference_id,
        idempotency_key=idempotency_key,
        metadata=metadata or {},
    )


def mutate_wallet(
    *,
    user,
    kind: str,
    amount,
    entry_type: str,
    reason: str,
    currency: str = '',
    reference_type: str = '',
    reference_id=None,
    idempotency_key: str | None = None,
    metadata: dict | None = None,
) -> WalletLedgerEntry:
    amount = normalize_amount(amount)
    existing = _existing_entry(idempotency_key)
    if existing:
        return existing

    with transaction.atomic():
        wallet = get_or_create_wallet(user, kind, currency)
        wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)

        if wallet.status != Wallet.Status.ACTIVE:
            raise exceptions.ValidationError({'wallet': 'Wallet is not active.'})

        if entry_type == WalletLedgerEntry.EntryType.CREDIT:
            wallet.available_balance += amount
        elif entry_type == WalletLedgerEntry.EntryType.DEBIT:
            if wallet.available_balance < amount:
                raise exceptions.ValidationError({'amount': 'Insufficient available balance.'})
            wallet.available_balance -= amount
        elif entry_type == WalletLedgerEntry.EntryType.HOLD:
            if wallet.available_balance < amount:
                raise exceptions.ValidationError({'amount': 'Insufficient available balance.'})
            wallet.available_balance -= amount
            wallet.held_balance += amount
        elif entry_type == WalletLedgerEntry.EntryType.RELEASE:
            if wallet.held_balance < amount:
                raise exceptions.ValidationError({'amount': 'Insufficient held balance.'})
            wallet.held_balance -= amount
            wallet.available_balance += amount
        elif entry_type == WalletLedgerEntry.EntryType.CAPTURE:
            if wallet.held_balance < amount:
                raise exceptions.ValidationError({'amount': 'Insufficient held balance.'})
            wallet.held_balance -= amount
        elif entry_type == WalletLedgerEntry.EntryType.ADJUSTMENT:
            wallet.available_balance += amount
        else:
            raise exceptions.ValidationError({'entry_type': 'Unsupported wallet mutation.'})

        wallet.save(update_fields=('available_balance', 'held_balance', 'updated_at'))
        return _ledger_entry(
            wallet=wallet,
            entry_type=entry_type,
            amount=amount,
            reason=reason,
            reference_type=reference_type,
            reference_id=reference_id,
            idempotency_key=idempotency_key,
            metadata=metadata,
        )


def credit_wallet(**kwargs):
    return mutate_wallet(entry_type=WalletLedgerEntry.EntryType.CREDIT, **kwargs)


def debit_wallet(**kwargs):
    return mutate_wallet(entry_type=WalletLedgerEntry.EntryType.DEBIT, **kwargs)


def hold_wallet_amount(**kwargs):
    return mutate_wallet(entry_type=WalletLedgerEntry.EntryType.HOLD, **kwargs)


def release_wallet_hold(**kwargs):
    return mutate_wallet(entry_type=WalletLedgerEntry.EntryType.RELEASE, **kwargs)


def capture_wallet_hold(**kwargs):
    return mutate_wallet(entry_type=WalletLedgerEntry.EntryType.CAPTURE, **kwargs)
