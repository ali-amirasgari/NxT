from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Wallet, WalletLedgerEntry
from .services import credit_wallet, ensure_default_wallets

# Points every new user starts with, so they can stake on goals from day one.
DEFAULT_SIGNUP_POINTS_GRANT = 1000


def signup_points_grant() -> int:
    """Read live so tests can override it via override_settings."""
    return int(getattr(settings, 'WALLET_SIGNUP_POINTS_GRANT', DEFAULT_SIGNUP_POINTS_GRANT))


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_wallets(sender, instance, created, **kwargs):
    if not created:
        return

    ensure_default_wallets(instance)

    grant = signup_points_grant()
    if grant > 0:
        credit_wallet(
            user=instance,
            kind=Wallet.Kind.POINTS,
            amount=grant,
            reason=WalletLedgerEntry.Reason.ADMIN_ADJUSTMENT,
            reference_type='signup',
            reference_id=instance.id,
            idempotency_key=f'signup-grant-{instance.id}',
            metadata={'grant': 'signup'},
        )
