from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from ..models import Follow

User = get_user_model()

# Profile fields exposed to / editable by the owning user.
PROFILE_FIELDS = (
    'display_name',
    'bio',
    'avatar_url',
    'location',
    'website',
    'instagram_url',
    'telegram_url',
    'is_private',
    'notifications_enabled',
)


class UserSerializer(serializers.ModelSerializer):
    """Public-safe representation. Mirrors the legacy ``user_payload`` shape
    (``id`` + ``user_id``) so existing frontend / chat-service contracts hold,
    and adds follow counts + the viewer's relationship to this user.

    Count / relationship fields prefer query annotations (see
    ``UserQuerySet.with_follow_counts`` / ``with_viewer_state``) and fall back
    to direct lookups for single, un-annotated instances.
    """

    user_id = serializers.IntegerField(source='id', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    is_followed_by = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'user_id',
            'username',
            'email',
            'is_staff',
            'followers_count',
            'following_count',
            'is_following',
            'is_followed_by',
            *PROFILE_FIELDS,
        )
        read_only_fields = fields

    def _viewer(self):
        request = self.context.get('request')
        return getattr(request, 'user', None) if request else None

    def get_followers_count(self, obj) -> int:
        annotated = getattr(obj, 'followers_count', None)
        return annotated if annotated is not None else obj.follower_links.count()

    def get_following_count(self, obj) -> int:
        annotated = getattr(obj, 'following_count', None)
        return annotated if annotated is not None else obj.following_links.count()

    def get_is_following(self, obj) -> bool:
        if hasattr(obj, 'is_following'):
            return bool(obj.is_following)
        viewer = self._viewer()
        if not viewer or not viewer.is_authenticated or viewer.pk == obj.pk:
            return False
        return Follow.objects.filter(follower=viewer, following=obj).exists()

    def get_is_followed_by(self, obj) -> bool:
        if hasattr(obj, 'is_followed_by'):
            return bool(obj.is_followed_by)
        viewer = self._viewer()
        if not viewer or not viewer.is_authenticated or viewer.pk == obj.pk:
            return False
        return Follow.objects.filter(follower=obj, following=viewer).exists()


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Partial update of the authenticated user's own profile/settings."""

    class Meta:
        model = User
        fields = PROFILE_FIELDS
