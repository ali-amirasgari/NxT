from __future__ import annotations

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from wallet.models import Wallet, WalletLedgerEntry
from wallet.serializers import (
    WalletEnvelopeSerializer,
    WalletLedgerEnvelopeSerializer,
    WalletListEnvelopeSerializer,
    WalletMutationEnvelopeSerializer,
    WalletMutationRequestSerializer,
)
from wallet.services import (
    capture_wallet_hold,
    credit_wallet,
    debit_wallet,
    ensure_default_wallets,
    hold_wallet_amount,
    release_wallet_hold,
)


def owned_wallet_or_404(user, wallet_id):
    try:
        return Wallet.objects.get(id=wallet_id, user=user)
    except Wallet.DoesNotExist:
        raise NotFound('Wallet not found.')


class WalletListView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Wallet'],
        operation_id='wallets_list',
        summary='List the authenticated user wallets',
        responses=WalletListEnvelopeSerializer,
    )
    def get(self, request):
        ensure_default_wallets(request.user)
        wallets = Wallet.objects.filter(user=request.user)
        return Response(WalletListEnvelopeSerializer({'wallets': wallets}).data)


class WalletDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Wallet'],
        operation_id='wallets_detail',
        summary='Get one owned wallet',
        responses=WalletEnvelopeSerializer,
    )
    def get(self, request, wallet_id):
        wallet = owned_wallet_or_404(request.user, wallet_id)
        return Response(WalletEnvelopeSerializer({'wallet': wallet}).data)


class WalletLedgerView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Wallet'],
        operation_id='wallets_ledger',
        summary='List ledger entries for one owned wallet',
        parameters=[
            OpenApiParameter('limit', int, description='Maximum entries, capped at 100.'),
            OpenApiParameter('entry_type', str, description='Filter by entry type.'),
            OpenApiParameter('reason', str, description='Filter by reason.'),
        ],
        responses=WalletLedgerEnvelopeSerializer,
    )
    def get(self, request, wallet_id):
        wallet = owned_wallet_or_404(request.user, wallet_id)
        entries = WalletLedgerEntry.objects.filter(wallet=wallet)
        entry_type = request.query_params.get('entry_type', '').strip()
        reason = request.query_params.get('reason', '').strip()
        raw_limit = request.query_params.get('limit', '50')

        if entry_type:
            entries = entries.filter(entry_type=entry_type)
        if reason:
            entries = entries.filter(reason=reason)
        try:
            limit = min(max(int(raw_limit), 1), 100)
        except ValueError:
            limit = 50

        return Response(
            WalletLedgerEnvelopeSerializer({'entries': entries[:limit]}).data
        )


class WalletMutationView(APIView):
    permission_classes = (IsAuthenticated,)
    mutation = None
    operation_id = 'wallets_mutation'
    summary = 'Apply a staff-only wallet mutation'

    @extend_schema(
        tags=['Wallet'],
        operation_id=None,
        summary=None,
        request=WalletMutationRequestSerializer,
        responses={201: WalletMutationEnvelopeSerializer},
    )
    def post(self, request):
        if not request.user.is_staff:
            raise PermissionDenied('Only staff can mutate wallets directly.')

        serializer = WalletMutationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        mutation = self.mutation
        entry = mutation(
            user=request.user,
            kind=data['kind'],
            currency=data.get('currency', ''),
            amount=data['amount'],
            reason=data['reason'],
            reference_type=data.get('reference_type', ''),
            reference_id=data.get('reference_id'),
            idempotency_key=data.get('idempotency_key') or None,
            metadata=data.get('metadata') or {},
        )
        entry.wallet.refresh_from_db()
        return Response(
            WalletMutationEnvelopeSerializer({
                'entry': entry,
                'wallet': entry.wallet,
            }).data,
            status=status.HTTP_201_CREATED,
        )


class WalletCreditView(WalletMutationView):
    mutation = staticmethod(credit_wallet)
    operation_id = 'wallets_credit'
    summary = 'Credit a wallet'


class WalletDebitView(WalletMutationView):
    mutation = staticmethod(debit_wallet)
    operation_id = 'wallets_debit'
    summary = 'Debit a wallet'


class WalletHoldView(WalletMutationView):
    mutation = staticmethod(hold_wallet_amount)
    operation_id = 'wallets_hold'
    summary = 'Hold wallet funds'


class WalletReleaseView(WalletMutationView):
    mutation = staticmethod(release_wallet_hold)
    operation_id = 'wallets_release'
    summary = 'Release held wallet funds'


class WalletCaptureView(WalletMutationView):
    mutation = staticmethod(capture_wallet_hold)
    operation_id = 'wallets_capture'
    summary = 'Capture held wallet funds'
