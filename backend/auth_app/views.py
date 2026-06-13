from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import exceptions, serializers, status
from rest_framework.authentication import CSRFCheck
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken


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


def user_payload(user):
    return {
        'id': user.id,
        'user_id': user.id,
        'username': user.get_username(),
        'email': user.email,
        'is_staff': user.is_staff,
    }


def token_payload(refresh, user):
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'user': user_payload(user),
    }


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        request = self.context.get('request')
        username = attrs.get('username') or attrs.get('email')
        if not username:
            raise serializers.ValidationError('Email or username is required.')

        user = authenticate(
            request=request,
            username=username,
            password=attrs['password'],
        )
        if user is None:
            raise serializers.ValidationError('Invalid username or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account is inactive.')
        attrs['user'] = user
        return attrs


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirmPassword = serializers.CharField(
        required=False,
        write_only=True,
        trim_whitespace=False,
    )

    def validate_email(self, value):
        User = get_user_model()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate(self, attrs):
        confirm_password = attrs.get('confirmPassword')
        if confirm_password is not None and attrs['password'] != confirm_password:
            raise serializers.ValidationError('Passwords do not match.')
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmPassword', None)
        email = validated_data['email'].lower()
        User = get_user_model()
        return User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
        )


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfTokenView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response({'csrfToken': get_token(request)})


class RegisterView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        response = Response(token_payload(refresh, user), status=status.HTTP_201_CREATED)
        set_jwt_cookies(response, refresh.access_token, refresh)
        return response


class LoginView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        response = Response(token_payload(refresh, user), status=status.HTTP_200_OK)
        set_jwt_cookies(response, refresh.access_token, refresh)
        return response


class RefreshView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    def post(self, request):
        refresh_token = (
            request.COOKIES.get(settings.JWT_COOKIE_REFRESH_NAME)
            or request.data.get('refresh')
            or request.data.get('refresh_token')
        )
        if refresh_token is None:
            return Response(
                {'detail': 'Refresh token is missing.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        serializer.is_valid(raise_exception=True)

        payload = {
            'access': serializer.validated_data['access'],
            'access_token': serializer.validated_data['access'],
        }
        if serializer.validated_data.get('refresh'):
            payload['refresh'] = serializer.validated_data['refresh']
            payload['refresh_token'] = serializer.validated_data['refresh']

        response = Response(payload, status=status.HTTP_200_OK)
        set_jwt_cookies(
            response,
            serializer.validated_data['access'],
            serializer.validated_data.get('refresh'),
        )
        return response


class LogoutView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    def post(self, request):
        enforce_csrf(request)
        refresh_token = request.COOKIES.get(settings.JWT_COOKIE_REFRESH_NAME)
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass

        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_jwt_cookies(response)
        return response


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response({'user': user_payload(request.user)})
