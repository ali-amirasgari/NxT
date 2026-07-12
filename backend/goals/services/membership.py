"""Invitation accept / decline for group-goal members.

Creating a group goal only *invites* members — nobody's points are touched
until they explicitly accept. Accepting holds their stake; declining removes
them from the goal. This guarantees you can never stake someone else's points
without their consent.
"""
from __future__ import annotations

from django.db import transaction
from rest_framework import exceptions

from wallet.models import Wallet, WalletLedgerEntry
from wallet.services import hold_wallet_amount

from ..models import GoalMember
from .staking import REFERENCE_TYPE, _ledger_key


def _member_or_403(goal, user) -> GoalMember:
    member = GoalMember.objects.select_related('user').filter(goal=goal, user=user).first()
    if member is None:
        raise exceptions.PermissionDenied('You are not invited to this goal.')
    return member


@transaction.atomic
def accept_goal_invitation(goal, user) -> GoalMember:
    member = _member_or_403(goal, user)
    if member.status == GoalMember.MemberStatus.ACCEPTED:
        return member  # idempotent

    member.status = GoalMember.MemberStatus.ACCEPTED
    member.save(update_fields=('status', 'updated_at'))

    # Hold the stake now that the member has opted in. Insufficient balance
    # raises here and rolls the accept back.
    if member.stake_amount > 0 and member.outcome == GoalMember.Outcome.COMMITTED:
        hold_wallet_amount(
            user=member.user,
            kind=Wallet.Kind.POINTS,
            amount=member.stake_amount,
            reason=WalletLedgerEntry.Reason.GOAL_STAKE_HOLD,
            reference_type=REFERENCE_TYPE,
            reference_id=goal.id,
            idempotency_key=_ledger_key(goal.id, member.id, 'hold'),
            metadata={'goal_id': goal.id, 'member_id': member.id},
        )
    return member


@transaction.atomic
def decline_goal_invitation(goal, user) -> None:
    member = _member_or_403(goal, user)
    if member.role == GoalMember.Role.OWNER:
        raise exceptions.ValidationError({'goal': 'The owner cannot decline their own goal.'})
    if member.status == GoalMember.MemberStatus.ACCEPTED:
        raise exceptions.ValidationError({'goal': 'You already accepted and staked on this goal.'})
    member.status = GoalMember.MemberStatus.DECLINED
    member.save(update_fields=('status', 'updated_at'))
