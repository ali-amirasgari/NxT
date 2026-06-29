from django.contrib import admin

from .models import Wallet, WalletLedgerEntry


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'kind', 'currency', 'status', 'available_balance', 'held_balance')
    list_filter = ('kind', 'currency', 'status')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(WalletLedgerEntry)
class WalletLedgerEntryAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'entry_type', 'amount', 'reason', 'created_at')
    list_filter = ('entry_type', 'reason')
    search_fields = ('wallet__user__username', 'wallet__user__email', 'idempotency_key')
    readonly_fields = (
        'wallet',
        'user',
        'entry_type',
        'amount',
        'balance_after',
        'held_balance_after',
        'reason',
        'reference_type',
        'reference_id',
        'idempotency_key',
        'metadata',
        'created_at',
        'updated_at',
    )
