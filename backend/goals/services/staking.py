"""The Commit -> Resolve economic loop.

A goal is a challenge. Every committed member stakes points (held from their
points wallet). At resolution the "pool" model applies:

* members who did NOT succeed forfeit their held stake into a pool;
* members who succeeded get their own stake released, then split the pool
  evenly as a reward.

If nobody succeeds the pool is burned (kept out of circulation) which keeps the
points economy from inflating. Everything is idempotent: re-running commit or
settle for the same goal re-uses the deterministic ledger keys and has no
double effect, so a retried cron run or a duplicated request is safe.
"""
from __future__ import annotations

from django.db import transaction

from wallet.models import Wallet, WalletLedgerEntry
from wallet.services import (
    capture_wallet_hold,
    credit_wallet,
    hold_wallet_amount,
    release_wallet_hold,
)

from ..models import Goal, GoalMember

REFERENCE_TYPE = 'goal'


def _ledger_key(goal_id: int, member_id: int, phase: str) -> str:
    """Deterministic idempotency key so a phase runs at most once per member."""
    return f'goal-{goal_id}-member-{member_id}-{phase}'


@transaction.atomic
def commit_goal_stakes(goal: Goal) -> None:
    """Hold every committed member's stake from their points wallet.

    Raises ``ValidationError`` (via the wallet service) if a member cannot
    cover the stake; callers should run this inside the same transaction as
    goal creation so an unaffordable stake rolls the whole goal back.
    """
    members = GoalMember.objects.select_related('user').filter(
        goal=goal, status=GoalMember.MemberStatus.ACCEPTED,
    )
    for member in members:
        if member.stake_amount <= 0:
            continue
        if member.outcome != GoalMember.Outcome.COMMITTED:
            continue
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


@transaction.atomic
def settle_goal(goal: Goal) -> dict:
    """Resolve a goal and pay out the pool.

    Members still ``COMMITTED`` at settle time count as failed — no proof means
    you lose. Returns a summary dict for logging.
    """
    goal = Goal.objects.select_for_update().get(pk=goal.id)
    members = list(
        GoalMember.objects.select_related('user').filter(
            goal=goal,
            stake_amount__gt=0,
            status=GoalMember.MemberStatus.ACCEPTED,
        )
    )

    winners = [m for m in members if m.outcome == GoalMember.Outcome.SUCCEEDED]
    losers = [m for m in members if m.outcome != GoalMember.Outcome.SUCCEEDED]

    # Losers forfeit their held stake into the pool.
    pool = 0
    for member in losers:
        capture_wallet_hold(
            user=member.user,
            kind=Wallet.Kind.POINTS,
            amount=member.stake_amount,
            reason=WalletLedgerEntry.Reason.GOAL_STAKE_CAPTURE,
            reference_type=REFERENCE_TYPE,
            reference_id=goal.id,
            idempotency_key=_ledger_key(goal.id, member.id, 'capture'),
            metadata={'goal_id': goal.id, 'member_id': member.id},
        )
        pool += member.stake_amount

    # Winners get their own stake back, then split the pool. Integer shares; any
    # remainder stays forfeited (burned) so the economy never mints points.
    share = pool // len(winners) if winners else 0
    for member in winners:
        release_wallet_hold(
            user=member.user,
            kind=Wallet.Kind.POINTS,
            amount=member.stake_amount,
            reason=WalletLedgerEntry.Reason.GOAL_STAKE_RELEASE,
            reference_type=REFERENCE_TYPE,
            reference_id=goal.id,
            idempotency_key=_ledger_key(goal.id, member.id, 'release'),
            metadata={'goal_id': goal.id, 'member_id': member.id},
        )
        if share > 0:
            credit_wallet(
                user=member.user,
                kind=Wallet.Kind.POINTS,
                amount=share,
                reason=WalletLedgerEntry.Reason.REWARD,
                reference_type=REFERENCE_TYPE,
                reference_id=goal.id,
                idempotency_key=_ledger_key(goal.id, member.id, 'reward'),
                metadata={'goal_id': goal.id, 'member_id': member.id, 'pool': pool},
            )

    goal.status = Goal.Status.COMPLETED
    goal.save(update_fields=('status', 'updated_at'))

    return {
        'goal_id': goal.id,
        'winners': len(winners),
        'losers': len(losers),
        'pool': pool,
        'reward_share': share,
    }
