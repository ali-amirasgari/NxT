from __future__ import annotations

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import GoalCoverSerializer, GoalEnvelopeSerializer
from .goals import goal_payload, goal_queryset_for


class GoalCoverView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Goals'],
        operation_id='goal_cover_upload',
        summary='Upload a cover image for a goal (owner only)',
        request=GoalCoverSerializer,
        responses=GoalEnvelopeSerializer,
    )
    def post(self, request, goal_id):
        goal = goal_queryset_for(request.user).filter(pk=goal_id).first()
        if goal is None:
            return Response({'detail': 'Goal not found.'}, status=status.HTTP_404_NOT_FOUND)
        if goal.owner_id != request.user.id:
            raise PermissionDenied('Only the goal owner can set the cover image.')

        serializer = GoalCoverSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        goal.cover_image = serializer.validated_data['cover_image']
        goal.save(update_fields=('cover_image', 'updated_at'))

        fresh = goal_queryset_for(request.user).get(pk=goal.pk)
        return Response(goal_payload(fresh, request))
