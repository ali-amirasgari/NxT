from __future__ import annotations

from rest_framework import serializers

from wallet.models import Wallet, WalletLedgerEntry


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = (
            'id',
            'kind',
            'currency',
            'status',
            'available_balance',
            'held_balance',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class WalletLedgerEntrySerializer(serializers.ModelSerializer):
    wallet_id = serializers.IntegerField(source='wallet.id', read_only=True)

    class Meta:
        model = WalletLedgerEntry
        fields = (
            'id',
            'wallet_id',
            'entry_type',
            'amount',
            'balance_after',
            'held_balance_after',
            'reason',
            'reference_type',
            'reference_id',
            'metadata',
            'created_at',
        )
        read_only_fields = fields


class WalletListEnvelopeSerializer(serializers.Serializer):
    wallets = WalletSerializer(many=True)


class WalletEnvelopeSerializer(serializers.Serializer):
    wallet = WalletSerializer()


class WalletLedgerEnvelopeSerializer(serializers.Serializer):
    entries = WalletLedgerEntrySerializer(many=True)


class WalletMutationRequestSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=Wallet.Kind.choices)
    currency = serializers.CharField(required=False, allow_blank=True, max_length=12)
    amount = serializers.DecimalField(max_digits=18, decimal_places=2)
    reason = serializers.ChoiceField(choices=WalletLedgerEntry.Reason.choices)
    reference_type = serializers.CharField(required=False, allow_blank=True, max_length=80)
    reference_id = serializers.IntegerField(required=False, allow_null=True, min_value=1)
    idempotency_key = serializers.CharField(required=False, allow_blank=True, max_length=160)
    metadata = serializers.JSONField(required=False)


class WalletMutationEnvelopeSerializer(serializers.Serializer):
    entry = WalletLedgerEntrySerializer()
    wallet = WalletSerializer()
