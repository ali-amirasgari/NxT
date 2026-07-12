from __future__ import annotations

from django.conf import settings


def public_media_url(file, request=None) -> str | None:
    """Browser-reachable URL for an uploaded file.

    Prefers ``MEDIA_PUBLIC_BASE_URL`` (set in Docker so the host browser can
    reach the backend, e.g. http://localhost:8000) over the request host, which
    inside Docker resolves to the unreachable ``backend`` service name.
    """
    if not file:
        return None
    url = file.url
    base = getattr(settings, 'MEDIA_PUBLIC_BASE_URL', '')
    if base:
        return f"{base.rstrip('/')}{url}"
    if request is not None:
        return request.build_absolute_uri(url)
    return url
