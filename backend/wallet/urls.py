from django.urls import path

from .views import (
    WalletCaptureView,
    WalletCreditView,
    WalletDebitView,
    WalletDetailView,
    WalletHoldView,
    WalletLedgerView,
    WalletListView,
    WalletReleaseView,
)

root_urlpatterns = [
    path('', WalletListView.as_view(), name='wallets-list-no-slash'),
]

urlpatterns = [
    path('', WalletListView.as_view(), name='wallets-list'),
    path('credit', WalletCreditView.as_view(), name='wallets-credit-no-slash'),
    path('credit/', WalletCreditView.as_view(), name='wallets-credit'),
    path('debit', WalletDebitView.as_view(), name='wallets-debit-no-slash'),
    path('debit/', WalletDebitView.as_view(), name='wallets-debit'),
    path('hold', WalletHoldView.as_view(), name='wallets-hold-no-slash'),
    path('hold/', WalletHoldView.as_view(), name='wallets-hold'),
    path('release', WalletReleaseView.as_view(), name='wallets-release-no-slash'),
    path('release/', WalletReleaseView.as_view(), name='wallets-release'),
    path('capture', WalletCaptureView.as_view(), name='wallets-capture-no-slash'),
    path('capture/', WalletCaptureView.as_view(), name='wallets-capture'),
    path('<int:wallet_id>', WalletDetailView.as_view(), name='wallets-detail-no-slash'),
    path('<int:wallet_id>/', WalletDetailView.as_view(), name='wallets-detail'),
    path('<int:wallet_id>/ledger', WalletLedgerView.as_view(), name='wallets-ledger-no-slash'),
    path('<int:wallet_id>/ledger/', WalletLedgerView.as_view(), name='wallets-ledger'),
]
