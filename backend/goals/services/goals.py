from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db import transaction

from ..models import Goal, GoalMember

User = get_user_model()


@transaction.atomic
def sync_goal_members(goal: Goal, owner, members: list[dict] | None = None) -> None:
    """Ensure the owner membership exists and replace non-owner members if provided."""
    GoalMember.objects.get_or_create(
        goal=goal,
        user=owner,
        defaults={
            'role': GoalMember.Role.OWNER,
            'stake_amount': goal.stake_points,
            'status': GoalMember.MemberStatus.ACCEPTED,
        },
    )

    if members is None:
        return

    GoalMember.objects.filter(goal=goal).exclude(user=owner).delete()
    user_ids = [item['user_id'] for item in members]
    users_by_id = {
        user.id: user
        for user in User.objects.filter(id__in=user_ids, is_active=True)
    }
    GoalMember.objects.bulk_create(
        [
            GoalMember(
                goal=goal,
                user=users_by_id[item['user_id']],
                role=item.get('role') or GoalMember.Role.MEMBER,
                stake_amount=goal.stake_points,
                status=GoalMember.MemberStatus.INVITED,
            )
            for item in members
            if item['user_id'] in users_by_id
        ],
        ignore_conflicts=True,
    )
