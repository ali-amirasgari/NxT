from __future__ import annotations

from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from users.serializers import UserSerializer

from social.models import Category
from social.serializers.category import CategorySerializer

from ..models import Goal, GoalMember

User = get_user_model()


class GoalMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = GoalMember
        fields = (
            'user_id',
            'user',
            'role',
            'created_at',
        )
        read_only_fields = fields


class GoalSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True, allow_null=True)
    members = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = (
            'id',
            'owner_id',
            'owner',
            'title',
            'description',
            'category_id',
            'category',
            'goal_type',
            'status',
            'progress',
            'stake_points',
            'schedule_label',
            'cover_color',
            'starts_at',
            'due_at',
            'members',
            'member_count',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields

    @extend_schema_field(GoalMemberSerializer(many=True))
    def get_members(self, obj):
        memberships = getattr(obj, 'prefetched_memberships', None)
        if memberships is None:
            memberships = obj.memberships.select_related('user').all()
        return GoalMemberSerializer(
            memberships,
            many=True,
            context=self.context,
        ).data

    def get_member_count(self, obj) -> int:
        annotated = getattr(obj, 'member_count', None)
        if annotated is not None:
            return annotated
        return obj.memberships.count()


class GoalMemberInputSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    role = serializers.ChoiceField(
        choices=(
            GoalMember.Role.ADMIN,
            GoalMember.Role.MEMBER,
        ),
        required=False,
        default=GoalMember.Role.MEMBER,
    )

    def validate_user_id(self, value: int) -> int:
        if not User.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError('User not found.')
        return value


class GoalCreateUpdateSerializer(serializers.ModelSerializer):
    members = GoalMemberInputSerializer(many=True, required=False)
    category_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Goal
        fields = (
            'title',
            'description',
            'category_id',
            'goal_type',
            'status',
            'progress',
            'stake_points',
            'schedule_label',
            'cover_color',
            'starts_at',
            'due_at',
            'members',
        )
        extra_kwargs = {
            'title': {'required': False},
        }

    def validate(self, attrs):
        request = self.context.get('request')
        owner = getattr(request, 'user', None)
        members = attrs.get('members')
        goal_type = attrs.get(
            'goal_type',
            self.instance.goal_type if self.instance else Goal.GoalType.SOLO,
        )

        if self.instance is None and not attrs.get('title'):
            raise serializers.ValidationError({'title': 'This field is required.'})

        if members and owner:
            owner_in_members = any(item['user_id'] == owner.id for item in members)
            if owner_in_members:
                raise serializers.ValidationError({
                    'members': 'Owner is added automatically.'
                })

        if goal_type == Goal.GoalType.SOLO and members:
            raise serializers.ValidationError({
                'members': 'Solo goals cannot have additional members.'
            })

        if 'category_id' in attrs:
            category_id = attrs.pop('category_id')
            if category_id:
                try:
                    attrs['category'] = Category.objects.get(id=category_id, is_active=True)
                except Category.DoesNotExist:
                    raise serializers.ValidationError({'category_id': 'Category not found.'})
            else:
                attrs['category'] = None

        return attrs


class GoalEnvelopeSerializer(serializers.Serializer):
    goal = GoalSerializer()


class GoalListEnvelopeSerializer(serializers.Serializer):
    goals = GoalSerializer(many=True)
