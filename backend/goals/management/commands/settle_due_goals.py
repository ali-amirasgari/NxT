"""Settle active goals whose due date has passed.

Wire this to a daily cron (no Celery/Redis needed):

    python manage.py settle_due_goals
"""
from __future__ import annotations

from django.core.management.base import BaseCommand
from django.utils import timezone

from goals.models import Goal
from goals.services import settle_goal


class Command(BaseCommand):
    help = 'Settle active goals whose due_at has passed (hold -> pool payout).'

    def handle(self, *args, **options):
        now = timezone.now()
        due = Goal.objects.filter(
            status=Goal.Status.ACTIVE,
            due_at__isnull=False,
            due_at__lte=now,
        )

        settled = 0
        for goal in due:
            result = settle_goal(goal)
            settled += 1
            self.stdout.write(self.style.SUCCESS(f'Settled goal {goal.id}: {result}'))

        self.stdout.write(f'Settled {settled} goal(s).')
