from __future__ import annotations

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..services import accept_goal_invitation, decline_goal_invitation
from .goals import goal_payload, goal_queryset_for


class GoalAcceptView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(tags=['Goals'], operation_id='goal_accept', summary='Accept a group-goal invitation')
    def post(self, request, goal_id):
        goal = goal_queryset_for(request.user).filter(pk=goal_id).first()
        if goal is None:
            return Response({'detail': 'Goal not found.'}, status=status.HTTP_404_NOT_FOUND)
        accept_goal_invitation(goal, request.user)
        fresh = goal_queryset_for(request.user).get(pk=goal.pk)
        return Response(goal_payload(fresh, request))


class GoalDeclineView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(tags=['Goals'], operation_id='goal_decline', summary='Decline a group-goal invitation')
    def post(self, request, goal_id):
        goal = goal_queryset_for(request.user).filter(pk=goal_id).first()
        if goal is None:
            return Response({'detail': 'Goal not found.'}, status=status.HTTP_404_NOT_FOUND)
        decline_goal_invitation(goal, request.user)
        return Response({'declined': True})
