from __future__ import annotations

from django.db import models

from users.models.base import TimestampedModel


class ActiveCategoryManager(models.Manager):
    def active(self):
        return self.filter(is_active=True)


class Category(TimestampedModel):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=96, unique=True)
    description = models.CharField(max_length=240, blank=True)
    icon = models.CharField(max_length=80, blank=True)
    color = models.CharField(max_length=40, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    objects = ActiveCategoryManager()

    class Meta:
        db_table = 'social_category'
        ordering = ('order', 'name')
        verbose_name_plural = 'categories'
        indexes = (
            models.Index(fields=('is_active', 'order'), name='category_active_order_idx'),
        )

    def __str__(self) -> str:
        return self.name
