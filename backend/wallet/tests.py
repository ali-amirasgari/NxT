from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Wallet, WalletLedgerEntry
from .services import credit_wallet, hold_wallet_amount, release_wallet_hold


# These test the wallet mutation mechanics in isolation, so switch off the
# product-level signup grant that would otherwise seed a balance + ledger entry.
@override_settings(WALLET_SIGNUP_POINTS_GRANT=0)
class WalletApiTests(APITestCase):
    password = 'StrongWalletPassword2026!'

    def create_user(self, email, is_staff=False):
        User = get_user_model()
        return User.objects.create_user(
            username=email,
            email=email,
            password=self.password,
            is_staff=is_staff,
        )

    def auth(self, user):
        response = self.client.post(
            reverse('auth-login'),
            {'email': user.email, 'password': self.password},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return f"Bearer {response.data['access_token']}"

    def test_default_wallets_are_created_for_new_user(self):
        user = self.create_user('wallet-user@example.com')
        wallets = Wallet.objects.filter(user=user)

        self.assertEqual(wallets.count(), 2)
        self.assertTrue(wallets.filter(kind=Wallet.Kind.POINTS, currency='').exists())
        self.assertTrue(wallets.filter(kind=Wallet.Kind.MONEY, currency='USD').exists())

    def test_credit_hold_and_release_write_ledger(self):
        user = self.create_user('ledger-user@example.com')

        credit_wallet(
            user=user,
            kind=Wallet.Kind.POINTS,
            amount='100.00',
            reason=WalletLedgerEntry.Reason.ADMIN_ADJUSTMENT,
        )
        hold_wallet_amount(
            user=user,
            kind=Wallet.Kind.POINTS,
            amount='40.00',
            reason=WalletLedgerEntry.Reason.GOAL_STAKE_HOLD,
        )
        release_wallet_hold(
            user=user,
            kind=Wallet.Kind.POINTS,
            amount='10.00',
            reason=WalletLedgerEntry.Reason.GOAL_STAKE_RELEASE,
        )

        wallet = Wallet.objects.get(user=user, kind=Wallet.Kind.POINTS)
        self.assertEqual(wallet.available_balance, Decimal('70.00'))
        self.assertEqual(wallet.held_balance, Decimal('30.00'))
        self.assertEqual(WalletLedgerEntry.objects.filter(wallet=wallet).count(), 3)

    def test_user_can_read_owned_wallets_and_ledger(self):
        user = self.create_user('reader@example.com')
        authorization = self.auth(user)
        credit_wallet(
            user=user,
            kind=Wallet.Kind.POINTS,
            amount='50.00',
            reason=WalletLedgerEntry.Reason.ADMIN_ADJUSTMENT,
        )
        wallet = Wallet.objects.get(user=user, kind=Wallet.Kind.POINTS)

        list_response = self.client.get(reverse('wallets-list'), HTTP_AUTHORIZATION=authorization)
        ledger_response = self.client.get(
            reverse('wallets-ledger', kwargs={'wallet_id': wallet.id}),
            HTTP_AUTHORIZATION=authorization,
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(ledger_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(ledger_response.data['entries']), 1)

    def test_direct_mutation_requires_staff(self):
        user = self.create_user('not-staff@example.com')
        response = self.client.post(
            reverse('wallets-credit'),
            {
                'kind': Wallet.Kind.POINTS,
                'amount': '10.00',
                'reason': WalletLedgerEntry.Reason.ADMIN_ADJUSTMENT,
            },
            format='json',
            HTTP_AUTHORIZATION=self.auth(user),
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
