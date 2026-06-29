from __future__ import annotations

from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import FollowResultSerializer, UserListEnvelopeSerializer
from ..services import follow_user, unfollow_user
from .helpers import get_active_user_or_404, user_payload

User = get_user_model()

FOLLOW_TAGS = ['Follow']


class FollowView(APIView):
    """POST to follow, DELETE to unfollow the user at ``user_id``."""

    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=FOLLOW_TAGS,
        operation_id='users_follow',
        summary='Follow a user',
        request=None,
        responses=FollowResultSerializer,
    )
    def post(self, request, user_id):
        target = get_active_user_or_404(user_id)
        created = follow_user(follower=request.user, following=target)
        fresh = get_active_user_or_404(user_id, viewer=request.user)
        return Response(
            {'created': created, 'user': user_payload(fresh, request)},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @extend_schema(
        tags=FOLLOW_TAGS,
        operation_id='users_unfollow',
        summary='Unfollow a user',
        request=None,
        responses=FollowResultSerializer,
    )
    def delete(self, request, user_id):
        target = get_active_user_or_404(user_id)
        removed = unfollow_user(follower=request.user, following=target)
        fresh = get_active_user_or_404(user_id, viewer=request.user)
        return Response({'removed': removed, 'user': user_payload(fresh, request)})


class FollowersListView(APIView):
    """Users who follow ``user_id``."""

    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=FOLLOW_TAGS,
        operation_id='users_followers',
        summary='List a user\'s followers',
        responses=UserListEnvelopeSerializer,
    )
    def get(self, request, user_id):
        get_active_user_or_404(user_id)
        followers = (
            User.objects.filter(is_active=True, following_links__following_id=user_id)
            .with_follow_counts()
            .with_viewer_state(request.user)
            .order_by('username')[:200]
        )
        return Response({'users': [user_payload(user, request) for user in followers]})


class FollowingListView(APIView):
    """Users that ``user_id`` follows."""

    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=FOLLOW_TAGS,
        operation_id='users_following',
        summary='List who a user follows',
        responses=UserListEnvelopeSerializer,
    )
    def get(self, request, user_id):
        get_active_user_or_404(user_id)
        following = (
            User.objects.filter(is_active=True, follower_links__follower_id=user_id)
            .with_follow_counts()
            .with_viewer_state(request.user)
            .order_by('username')[:200]
        )
        return Response({'users': [user_payload(user, request) for user in following]})
