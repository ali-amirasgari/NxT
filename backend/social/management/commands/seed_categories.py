from __future__ import annotations

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from social.models import Category

DEFAULT_CATEGORIES = [
    ('Fitness', 'solar:dumbbell-linear', 'primary', 'Workouts, runs and movement goals.'),
    ('Coding', 'solar:code-linear', 'secondary', 'Shipping software and building in public.'),
    ('Learning', 'solar:book-linear', 'muted', 'Courses, skills and study streaks.'),
    ('Reading', 'solar:notebook-linear', 'card', 'Daily reading and book goals.'),
    ('Mindfulness', 'solar:meditation-linear', 'primary', 'Meditation, journaling and calm.'),
    ('Career', 'solar:case-linear', 'secondary', 'Work, growth and professional goals.'),
    ('Finance', 'solar:wallet-linear', 'muted', 'Saving, budgeting and money habits.'),
    ('Nutrition', 'solar:cup-hot-linear', 'card', 'Eating well and healthy habits.'),
    ('Creative', 'solar:palette-linear', 'primary', 'Art, writing and side projects.'),
]


class Command(BaseCommand):
    help = 'Seed the default social categories (idempotent).'

    def handle(self, *args, **options):
        created = 0
        updated = 0
        for index, (name, icon, color, description) in enumerate(DEFAULT_CATEGORIES):
            _, was_created = Category.objects.update_or_create(
                slug=slugify(name),
                defaults={
                    'name': name,
                    'icon': icon,
                    'color': color,
                    'description': description,
                    'order': index,
                    'is_active': True,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Categories seeded: {created} created, {updated} updated.'
            )
        )
