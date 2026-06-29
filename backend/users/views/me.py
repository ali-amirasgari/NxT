from __future__ import annotations

from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import (
    ProfileUpdateSerializer,
    UserEnvelopeSerializer,
)
from .helpers import user_payload

User = get_user_model()


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def _annotated_self(self, request):
        return (
            User.objects.with_follow_counts()
            .with_viewer_state(request.user)
            .get(pk=request.user.pk)
        )

    @extend_schema(
        tags=['Users'],
        operation_id='users_me_retrieve',
        summary='Get the authenticated user',
        responses=UserEnvelopeSerializer,
    )
    def get(self, request):
        return Response({'user': user_payload(self._annotated_self(request), request)})

    @extend_schema(
        tags=['Users'],
        operation_id='users_me_update',
        summary='Update the authenticated user profile',
        request=ProfileUpdateSerializer,
        responses=UserEnvelopeSerializer,
    )
    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            instance=request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'user': user_payload(self._annotated_self(request), request)})
