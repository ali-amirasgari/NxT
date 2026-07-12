"""Proof submission and peer review for GROUP goals.

Each staked member submits their own proof; the *other* staked members vote.
A member succeeds when a strict majority of the other members approve, and
fails once that majority is mathematically out of reach. When every staked
member has a decided outcome the goal settles immediately; otherwise the due
cron settles it (treating anyone still undecided as failed).
"""
from __future__ import annotations

from django.db import transaction
from rest_framework import exceptions

from ..models import Goal, GoalMember, GoalProof, ProofReview
from .staking import settle_goal


def _staked_members(goal: Goal):
    return GoalMember.objects.filter(
        goal=goal,
        stake_amount__gt=0,
        status=GoalMember.MemberStatus.ACCEPTED,
    )


def _require_group(goal: Goal) -> None:
    if goal.goal_type != Goal.GoalType.GROUP:
        raise exceptions.ValidationError(
            {'goal': 'Proofs are only used for group goals.'}
        )


def _require_member(goal: Goal, user) -> GoalMember:
    member = GoalMember.objects.filter(goal=goal, user=user).first()
    if member is None:
        raise exceptions.PermissionDenied('You are not a member of this goal.')
    if member.status != GoalMember.MemberStatus.ACCEPTED:
        raise exceptions.PermissionDenied('Accept the goal before submitting or reviewing proof.')
    return member


@transaction.atomic
def submit_proof(goal: Goal, author, media, note: str = '') -> GoalProof:
    _require_group(goal)
    _require_member(goal, author)

    proof, _ = GoalProof.objects.get_or_create(goal=goal, author=author)
    # Resubmission replaces the evidence and wipes any prior votes.
    proof.reviews.all().delete()
    proof.media = media
    proof.note = note or ''
    proof.status = GoalProof.Status.PENDING
    proof.save()
    return proof


def _evaluate(proof: GoalProof) -> str | None:
    """Return the author's outcome from the votes, or None if undecided."""
    eligible = _staked_members(proof.goal).exclude(user=proof.author).count()
    if eligible == 0:
        return None

    approvals = proof.reviews.filter(vote=ProofReview.Vote.APPROVE).count()
    rejections = proof.reviews.filter(vote=ProofReview.Vote.REJECT).count()
    pending = eligible - approvals - rejections
    needed = eligible // 2 + 1  # strict majority

    if approvals >= needed:
        return GoalMember.Outcome.SUCCEEDED
    if approvals + pending < needed:  # majority no longer reachable
        return GoalMember.Outcome.FAILED
    return None


@transaction.atomic
def record_review(proof: GoalProof, reviewer, vote: str) -> dict:
    goal = proof.goal
    _require_group(goal)
    _require_member(goal, reviewer)
    if reviewer.id == proof.author_id:
        raise exceptions.ValidationError({'reviewer': 'You cannot review your own proof.'})

    ProofReview.objects.update_or_create(
        proof=proof, reviewer=reviewer, defaults={'vote': vote},
    )

    outcome = _evaluate(proof)
    settled = False
    if outcome is not None:
        proof.status = (
            GoalProof.Status.APPROVED
            if outcome == GoalMember.Outcome.SUCCEEDED
            else GoalProof.Status.REJECTED
        )
        proof.save(update_fields=('status', 'updated_at'))
        GoalMember.objects.filter(goal=goal, user=proof.author).update(outcome=outcome)

        # If every staked member is now decided, settle the goal right away.
        undecided = _staked_members(goal).filter(
            outcome=GoalMember.Outcome.COMMITTED
        ).exists()
        if not undecided and goal.status == Goal.Status.ACTIVE:
            settle_goal(goal)
            settled = True

    return {'proof_status': proof.status, 'settled': settled}


@transaction.atomic
def resolve_solo_success(goal: Goal) -> dict:
    """Solo self-report: the owner marks the goal done -> stake released."""
    if goal.goal_type != Goal.GoalType.SOLO:
        raise exceptions.ValidationError({'goal': 'Not a solo goal.'})
    GoalMember.objects.filter(goal=goal, user=goal.owner).update(
        outcome=GoalMember.Outcome.SUCCEEDED
    )
    return settle_goal(goal)
