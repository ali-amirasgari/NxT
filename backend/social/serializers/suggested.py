from __future__ import annotations

from rest_framework import serializers

from goals.models import Goal
from users.serializers import UserSerializer

from social.serializers.category import CategorySerializer
from social.serializers.post import PostSerializer


class SuggestedGoalSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True, allow_null=True)

    class Meta:
        model = Goal
        fields = (
            'id',
            'owner_id',
            'owner',
            'category_id',
            'category',
            'title',
            'description',
            'goal_type',
            'status',
            'progress',
            'stake_points',
            'created_at',
        )
        read_only_fields = fields


class SuggestedCategorySerializer(serializers.Serializer):
    category = CategorySerializer()
    posts = PostSerializer(many=True)
    goals = SuggestedGoalSerializer(many=True)


class SuggestedEnvelopeSerializer(serializers.Serializer):
    suggested = SuggestedCategorySerializer(many=True)
