from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import Q
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import UserEnvelopeSerializer, UserListEnvelopeSerializer
from .helpers import get_active_user_or_404, user_payload

User = get_user_model()


class UserListView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Users'],
        operation_id='users_list',
        summary='Search / list users',
        parameters=[
            OpenApiParameter('search', str, description='Filter by username, email, or display name.'),
            OpenApiParameter('ids', str, description='Comma-separated user ids to fetch.'),
        ],
        responses=UserListEnvelopeSerializer,
    )
    def get(self, request):
        users = (
            User.objects.filter(is_active=True)
            .exclude(id=request.user.id)
            .with_follow_counts()
            .with_viewer_state(request.user)
        )
        search = request.query_params.get('search', '').strip()
        raw_ids = request.query_params.get('ids', '')

        if raw_ids:
            user_ids = [value for value in raw_ids.split(',') if value.strip().isdigit()]
            users = users.filter(id__in=user_ids)

        if search:
            users = users.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(display_name__icontains=search)
            )

        return Response({
            'users': [
                user_payload(user, request)
                for user in users.order_by('username')[:50]
            ],
        })


class UserDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Users'],
        operation_id='users_detail',
        summary='Get a user by id',
        responses=UserEnvelopeSerializer,
    )
    def get(self, request, user_id):
        user = get_active_user_or_404(user_id, viewer=request.user)
        return Response({'user': user_payload(user, request)})
