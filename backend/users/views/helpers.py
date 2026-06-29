from __future__ import annotations

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck

from ..serializers import UserSerializer

User = get_user_model()


# --- JWT cookie helpers ---------------------------------------------------

def cookie_options(path):
    return {
        'httponly': settings.JWT_COOKIE_HTTPONLY,
        'secure': settings.JWT_COOKIE_SECURE,
        'samesite': settings.JWT_COOKIE_SAMESITE,
        'domain': settings.JWT_COOKIE_DOMAIN,
        'path': path,
    }


def set_jwt_cookies(response, access_token, refresh_token=None):
    response.set_cookie(
        settings.JWT_COOKIE_ACCESS_NAME,
        str(access_token),
        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        **cookie_options(settings.JWT_COOKIE_ACCESS_PATH),
    )

    if refresh_token is not None:
        response.set_cookie(
            settings.JWT_COOKIE_REFRESH_NAME,
            str(refresh_token),
            max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
            **cookie_options(settings.JWT_COOKIE_REFRESH_PATH),
        )


def clear_jwt_cookies(response):
    response.delete_cookie(
        settings.JWT_COOKIE_ACCESS_NAME,
        domain=settings.JWT_COOKIE_DOMAIN,
        path=settings.JWT_COOKIE_ACCESS_PATH,
        samesite=settings.JWT_COOKIE_SAMESITE,
    )
    response.delete_cookie(
        settings.JWT_COOKIE_REFRESH_NAME,
        domain=settings.JWT_COOKIE_DOMAIN,
        path=settings.JWT_COOKIE_REFRESH_PATH,
        samesite=settings.JWT_COOKIE_SAMESITE,
    )


def enforce_csrf(request):
    check = CSRFCheck(lambda req: None)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied(f'CSRF Failed: {reason}')


# --- payload helpers ------------------------------------------------------

def user_payload(user, request=None):
    return UserSerializer(user, context={'request': request}).data


def token_payload(refresh, user, request=None):
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'user': user_payload(user, request),
    }


def get_active_user_or_404(user_id, viewer=None):
    """Fetch an active user annotated with follow counts + viewer relationship."""
    try:
        return (
            User.objects.with_follow_counts()
            .with_viewer_state(viewer)
            .get(id=user_id, is_active=True)
        )
    except User.DoesNotExist:
        raise exceptions.NotFound('User not found.')
