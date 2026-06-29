"""Documentation-only serializers describing the response envelopes the views
return, so drf-spectacular renders accurate schemas in Swagger/Redoc."""

from __future__ import annotations

from rest_framework import serializers

from .user import UserSerializer


class UserEnvelopeSerializer(serializers.Serializer):
    user = UserSerializer()


class UserListEnvelopeSerializer(serializers.Serializer):
    users = UserSerializer(many=True)


class FollowResultSerializer(serializers.Serializer):
    created = serializers.BooleanField(required=False)
    removed = serializers.BooleanField(required=False)
    user = UserSerializer()


class CsrfTokenResponseSerializer(serializers.Serializer):
    csrfToken = serializers.CharField()


class AuthTokenResponseSerializer(serializers.Serializer):
    """Returned by register / login."""

    access = serializers.CharField()
    refresh = serializers.CharField()
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    user = UserSerializer()


class AccessTokenResponseSerializer(serializers.Serializer):
    """Returned by refresh."""

    access = serializers.CharField()
    access_token = serializers.CharField()
    refresh = serializers.CharField(required=False)
    refresh_token = serializers.CharField(required=False)


class RefreshRequestSerializer(serializers.Serializer):
    """Refresh token is normally read from the HttpOnly cookie; this body is optional."""

    refresh = serializers.CharField(required=False)
    refresh_token = serializers.CharField(required=False)


class LogoutRequestSerializer(serializers.Serializer):
    """Tokens are normally read from cookies; this body is optional."""

    refresh = serializers.CharField(required=False)
    refresh_token = serializers.CharField(required=False)
