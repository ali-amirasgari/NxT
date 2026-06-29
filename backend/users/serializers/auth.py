from __future__ import annotations

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs: dict) -> dict:
        request = self.context.get('request')
        username = attrs.get('username') or attrs.get('email')
        if not username:
            raise serializers.ValidationError('Email or username is required.')

        user = authenticate(request=request, username=username, password=attrs['password'])
        if user is None:
            raise serializers.ValidationError('Invalid username or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account is inactive.')

        attrs['user'] = user
        return attrs


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirmPassword = serializers.CharField(required=False, write_only=True, trim_whitespace=False)
    display_name = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate(self, attrs: dict) -> dict:
        confirm_password = attrs.get('confirmPassword')
        if confirm_password is not None and attrs['password'] != confirm_password:
            raise serializers.ValidationError('Passwords do not match.')
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data: dict) -> 'User':
        validated_data.pop('confirmPassword', None)
        email = validated_data['email'].lower()
        return User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            display_name=validated_data.get('display_name', ''),
        )
