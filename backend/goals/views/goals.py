from __future__ import annotations

from django.db.models import Count, Q, Prefetch
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Goal, GoalMember
from ..serializers import (
    GoalCreateUpdateSerializer,
    GoalEnvelopeSerializer,
    GoalListEnvelopeSerializer,
)
from ..services import sync_goal_members


def goal_queryset_for(user):
    return (
        Goal.objects.filter(
            Q(owner=user) | Q(memberships__user=user),
        )
        .select_related('owner', 'category')
        .prefetch_related(
            Prefetch(
                'memberships',
                queryset=GoalMember.objects.select_related('user'),
                to_attr='prefetched_memberships',
            )
        )
        .annotate(member_count=Count('memberships', distinct=True))
        .distinct()
    )


def goal_payload(goal, request):
    return GoalEnvelopeSerializer(
        {'goal': goal},
        context={'request': request},
    ).data


class GoalListCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Goals'],
        operation_id='goals_list',
        summary='List goals visible to the authenticated user',
        parameters=[
            OpenApiParameter('status', str, description='Filter by goal status.'),
            OpenApiParameter('category', str, description='Filter by category.'),
            OpenApiParameter('search', str, description='Filter by title or description.'),
        ],
        responses=GoalListEnvelopeSerializer,
    )
    def get(self, request):
        goals = goal_queryset_for(request.user)
        status_filter = request.query_params.get('status', '').strip()
        category = request.query_params.get('category', '').strip()
        search = request.query_params.get('search', '').strip()

        if status_filter:
            goals = goals.filter(status=status_filter)
        if category:
            goals = goals.filter(
                Q(category__slug__iexact=category) | Q(category__name__iexact=category)
            )
        if search:
            goals = goals.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return Response(
            GoalListEnvelopeSerializer(
                {'goals': goals[:100]},
                context={'request': request},
            ).data
        )

    @extend_schema(
        tags=['Goals'],
        operation_id='goals_create',
        summary='Create a goal',
        request=GoalCreateUpdateSerializer,
        responses={201: GoalEnvelopeSerializer},
    )
    def post(self, request):
        serializer = GoalCreateUpdateSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        members = serializer.validated_data.pop('members', None)
        goal = serializer.save(owner=request.user)
        sync_goal_members(goal, request.user, members)
        fresh = goal_queryset_for(request.user).get(pk=goal.pk)
        return Response(goal_payload(fresh, request), status=status.HTTP_201_CREATED)


class GoalDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_goal(self, request, goal_id):
        try:
            return goal_queryset_for(request.user).get(pk=goal_id)
        except Goal.DoesNotExist:
            return None

    @extend_schema(
        tags=['Goals'],
        operation_id='goals_detail',
        summary='Get a goal',
        responses=GoalEnvelopeSerializer,
    )
    def get(self, request, goal_id):
        goal = self.get_goal(request, goal_id)
        if goal is None:
            return Response({'detail': 'Goal not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(goal_payload(goal, request))

    @extend_schema(
        tags=['Goals'],
        operation_id='goals_update',
        summary='Update a goal owned by the authenticated user',
        request=GoalCreateUpdateSerializer,
        responses=GoalEnvelopeSerializer,
    )
    def patch(self, request, goal_id):
        goal = self.get_goal(request, goal_id)
        if goal is None:
            return Response({'detail': 'Goal not found.'}, status=status.HTTP_404_NOT_FOUND)
        if goal.owner_id != request.user.id:
            raise PermissionDenied('Only the goal owner can update this goal.')

        serializer = GoalCreateUpdateSerializer(
            instance=goal,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        members = serializer.validated_data.pop('members', None)
        goal = serializer.save()
        sync_goal_members(goal, request.user, members)
        fresh = goal_queryset_for(request.user).get(pk=goal.pk)
        return Response(goal_payload(fresh, request))

    @extend_schema(
        tags=['Goals'],
        operation_id='goals_delete',
        summary='Delete a goal owned by the authenticated user',
        responses={204: None},
    )
    def delete(self, request, goal_id):
        goal = self.get_goal(request, goal_id)
        if goal is None:
            return Response({'detail': 'Goal not found.'}, status=status.HTTP_404_NOT_FOUND)
        if goal.owner_id != request.user.id:
            raise PermissionDenied('Only the goal owner can delete this goal.')
        goal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
