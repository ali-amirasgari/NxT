from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck
from rest_framework_simplejwt.authentication import JWTAuthentication


class EmailOrUsernameBackend(ModelBackend):
    """Authenticate with either the username or the email (case-insensitive).

    The frontend signs in by email, while superusers created via
    ``createsuperuser`` have a username distinct from their email. This lets
    both work without weakening any password checks.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        User = get_user_model()
        identifier = username or kwargs.get(User.USERNAME_FIELD)
        if not identifier or not password:
            return None

        try:
            user = User.objects.get(Q(username__iexact=identifier) | Q(email__iexact=identifier))
        except User.DoesNotExist:
            # Run the hasher once to mitigate timing-based user enumeration.
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None


class CookieJWTAuthentication(JWTAuthentication):
    """
    Authenticate DRF requests with either the Authorization header or the
    HttpOnly access-token cookie. Header auth (used by the chat-service and the
    Next.js BFF) skips CSRF; cookie auth enforces it for unsafe methods.
    """

    def authenticate(self, request):
        header = self.get_header(request)

        if header is not None:
            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token

        raw_token = request.COOKIES.get(settings.JWT_COOKIE_ACCESS_NAME)
        if raw_token is None:
            return None

        self.enforce_csrf(request)
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token

    def enforce_csrf(self, request):
        if request.method in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            return

        check = CSRFCheck(lambda req: None)
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise exceptions.PermissionDenied(f'CSRF Failed: {reason}')
