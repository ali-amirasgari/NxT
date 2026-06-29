from __future__ import annotations

from django.conf import settings
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from ..serializers import (
    AccessTokenResponseSerializer,
    AuthTokenResponseSerializer,
    CsrfTokenResponseSerializer,
    LoginSerializer,
    LogoutRequestSerializer,
    RefreshRequestSerializer,
    RegisterSerializer,
)
from .helpers import (
    clear_jwt_cookies,
    enforce_csrf,
    set_jwt_cookies,
    token_payload,
)

AUTH_TAGS = ['Auth']


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfTokenView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @extend_schema(
        tags=AUTH_TAGS,
        operation_id='auth_csrf',
        summary='Get CSRF token',
        responses=CsrfTokenResponseSerializer,
    )
    def get(self, request):
        return Response({'csrfToken': get_token(request)})


class RegisterView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @extend_schema(
        tags=AUTH_TAGS,
        operation_id='auth_register',
        summary='Register a new account',
        request=RegisterSerializer,
        responses={201: AuthTokenResponseSerializer},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        response = Response(token_payload(refresh, user, request), status=status.HTTP_201_CREATED)
        set_jwt_cookies(response, refresh.access_token, refresh)
        return response


class LoginView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @extend_schema(
        tags=AUTH_TAGS,
        operation_id='auth_login',
        summary='Log in',
        request=LoginSerializer,
        responses={200: AuthTokenResponseSerializer},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        response = Response(token_payload(refresh, user, request), status=status.HTTP_200_OK)
        set_jwt_cookies(response, refresh.access_token, refresh)
        return response


class RefreshView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @extend_schema(
        tags=AUTH_TAGS,
        operation_id='auth_refresh',
        summary='Refresh access token',
        request=RefreshRequestSerializer,
        responses={200: AccessTokenResponseSerializer},
    )
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
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response(
                {'detail': 'Refresh token is invalid or expired.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

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

    @extend_schema(
        tags=AUTH_TAGS,
        operation_id='auth_logout',
        summary='Log out (blacklist refresh token)',
        request=LogoutRequestSerializer,
        responses={204: None},
    )
    def post(self, request):
        cookie_refresh_token = request.COOKIES.get(settings.JWT_COOKIE_REFRESH_NAME)
        if cookie_refresh_token:
            enforce_csrf(request)

        refresh_token = (
            cookie_refresh_token
            or request.data.get('refresh')
            or request.data.get('refresh_token')
        )
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass

        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_jwt_cookies(response)
        return response
