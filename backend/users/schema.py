"""drf-spectacular preprocessing.

The project intentionally registers every endpoint twice (trailing-slash and
no-slash) and mounts the auth routes under both ``/auth/`` and ``/api/auth/``.
For the OpenAPI doc we expose a single canonical path per endpoint so Swagger
stays clean and free of duplicate operations.
"""

from __future__ import annotations

from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CookieJWTScheme(OpenApiAuthenticationExtension):
    """Document CookieJWTAuthentication: Bearer access token (used by Swagger's
    Authorize button and the chat-service); the browser also sends the access
    token via the HttpOnly cookie automatically."""

    target_class = 'users.authentication.CookieJWTAuthentication'
    name = 'jwtAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'bearerFormat': 'JWT',
        }


# Canonical (trailing-slash) path per logical endpoint — matches how the
# frontend BFF and chat-service actually call the backend.
CANONICAL_PATHS = {
    '/auth/csrf/',
    '/auth/register/',
    '/auth/login/',
    '/auth/refresh/',
    '/auth/logout/',
    '/users/me/',
    '/users/',
    '/users/{user_id}/',
    '/users/{user_id}/follow/',
    '/users/{user_id}/followers/',
    '/users/{user_id}/following/',
}


def keep_canonical_paths(endpoints):
    return [
        endpoint
        for endpoint in endpoints
        if endpoint[0] in CANONICAL_PATHS
    ]
