from __future__ import annotations

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from goals.models import Goal

from social.models import Category, Post
from social.serializers import (
    CategoryListEnvelopeSerializer,
    CategorySerializer,
    SuggestedEnvelopeSerializer,
)
from social.serializers.post import PostSerializer
from social.serializers.suggested import SuggestedGoalSerializer
from social.views.posts import post_queryset_for

POSTS_PER_CATEGORY = 6
GOALS_PER_CATEGORY = 4
MAX_CATEGORIES = 12


def goal_discovery_queryset():
    return (
        Goal.objects.filter(status=Goal.Status.ACTIVE, category__isnull=False)
        .select_related('owner', 'category')
        .prefetch_related(
            'memberships',
        )
    )


class CategoryListView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Social'],
        operation_id='categories_list',
        summary='List active categories',
        responses=CategoryListEnvelopeSerializer,
    )
    def get(self, request):
        categories = Category.objects.active().order_by('order', 'name')
        return Response(
            CategoryListEnvelopeSerializer(
                {'categories': categories},
                context={'request': request},
            ).data
        )


class SuggestedView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Social'],
        operation_id='suggested_list',
        summary='Suggested categories with their posts and goals',
        parameters=[
            OpenApiParameter(
                'category',
                str,
                description='Restrict to a single category slug.',
            ),
        ],
        responses=SuggestedEnvelopeSerializer,
    )
    def get(self, request):
        slug = request.query_params.get('category', '').strip()
        categories = Category.objects.active().order_by('order', 'name')
        if slug and slug != 'for-you':
            categories = categories.filter(slug=slug)
        categories = list(categories[:MAX_CATEGORIES])

        if not categories:
            return Response({'suggested': []})

        category_ids = [category.id for category in categories]
        posts_qs = post_queryset_for(request.user).filter(
            visibility=Post.Visibility.PUBLIC,
            category_id__in=category_ids,
        )
        goals_qs = goal_discovery_queryset().filter(category_id__in=category_ids)

        posts_by_category: dict[int, list] = {cid: [] for cid in category_ids}
        for post in posts_qs:
            bucket = posts_by_category[post.category_id]
            if len(bucket) < POSTS_PER_CATEGORY:
                bucket.append(post)

        goals_by_category: dict[int, list] = {cid: [] for cid in category_ids}
        for goal in goals_qs:
            bucket = goals_by_category[goal.category_id]
            if len(bucket) < GOALS_PER_CATEGORY:
                bucket.append(goal)

        suggested = []
        for category in categories:
            category_posts = posts_by_category.get(category.id, [])
            category_goals = goals_by_category.get(category.id, [])
            if not category_posts and not category_goals:
                continue
            suggested.append(
                {
                    'category': CategorySerializer(category, context={'request': request}).data,
                    'posts': PostSerializer(
                        category_posts, many=True, context={'request': request}
                    ).data,
                    'goals': SuggestedGoalSerializer(
                        category_goals, many=True, context={'request': request}
                    ).data,
                }
            )

        return Response({'suggested': suggested})
