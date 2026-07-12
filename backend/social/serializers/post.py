from __future__ import annotations

from rest_framework import serializers

from conf.media import public_media_url
from goals.models import Goal
from users.serializers import UserSerializer

from social.models import Category, Comment, Post, PostShare
from social.serializers.category import CategorySerializer


class GoalSummarySerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Goal
        fields = ('id', 'title', 'category')
        read_only_fields = fields


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    goal = GoalSummarySerializer(read_only=True)
    goal_id = serializers.IntegerField(source='goal.id', read_only=True, allow_null=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True, allow_null=True)
    media_url = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    saves_count = serializers.SerializerMethodField()
    shares_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id',
            'author_id',
            'author',
            'goal_id',
            'goal',
            'category_id',
            'category',
            'title',
            'caption',
            'media_url',
            'media_type',
            'media_tone',
            'visibility',
            'likes_count',
            'comments_count',
            'saves_count',
            'shares_count',
            'is_liked',
            'is_saved',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields

    def get_likes_count(self, obj) -> int:
        return getattr(obj, 'likes_count', None) or obj.likes.count()

    def get_comments_count(self, obj) -> int:
        return getattr(obj, 'comments_count', None) or obj.comments.count()

    def get_saves_count(self, obj) -> int:
        return getattr(obj, 'saves_count', None) or obj.saves.count()

    def get_shares_count(self, obj) -> int:
        return getattr(obj, 'shares_count', None) or obj.shares.count()

    def get_is_liked(self, obj) -> bool:
        return bool(getattr(obj, 'is_liked', False))

    def get_is_saved(self, obj) -> bool:
        return bool(getattr(obj, 'is_saved', False))

    def get_media_url(self, obj) -> str | None:
        if obj.media:
            return public_media_url(obj.media, self.context.get('request'))
        return obj.media_url or None


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    goal_id = serializers.IntegerField(required=False, allow_null=True)
    category_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Post
        fields = (
            'goal_id',
            'category_id',
            'title',
            'caption',
            'media',
            'media_url',
            'media_type',
            'media_tone',
            'visibility',
        )
        extra_kwargs = {
            'title': {'required': False},
            'media': {'required': False},
        }

    def validate(self, attrs):
        if self.instance is None and not attrs.get('title'):
            raise serializers.ValidationError({'title': 'This field is required.'})
        # A post must carry an image or video.
        if self.instance is None and not attrs.get('media') and not attrs.get('media_url'):
            raise serializers.ValidationError({'media': 'An image or video is required.'})
        # Infer media_type from the uploaded file so the client doesn't have to.
        media = attrs.get('media')
        if media is not None:
            content_type = getattr(media, 'content_type', '') or ''
            attrs['media_type'] = (
                Post.MediaType.VIDEO
                if content_type.startswith('video')
                else Post.MediaType.IMAGE
            )
        goal_id = attrs.pop('goal_id', None)
        if goal_id:
            try:
                attrs['goal'] = Goal.objects.get(id=goal_id)
            except Goal.DoesNotExist:
                raise serializers.ValidationError({'goal_id': 'Goal not found.'})
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


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    post_id = serializers.IntegerField(source='post.id', read_only=True)
    parent_id = serializers.IntegerField(source='parent.id', read_only=True, allow_null=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            'id',
            'post_id',
            'author_id',
            'author',
            'parent_id',
            'body',
            'likes_count',
            'is_liked',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields

    def get_likes_count(self, obj) -> int:
        return getattr(obj, 'likes_count', None) or obj.likes.count()

    def get_is_liked(self, obj) -> bool:
        return bool(getattr(obj, 'is_liked', False))


class CommentCreateSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=1000)
    parent_id = serializers.IntegerField(required=False, allow_null=True)


class ShareCreateSerializer(serializers.Serializer):
    channel = serializers.ChoiceField(choices=PostShare.Channel.choices, default=PostShare.Channel.COPY)
    target_user_id = serializers.IntegerField(required=False, allow_null=True)


class PostEnvelopeSerializer(serializers.Serializer):
    post = PostSerializer()


class PostListEnvelopeSerializer(serializers.Serializer):
    posts = PostSerializer(many=True)


class CommentEnvelopeSerializer(serializers.Serializer):
    comment = CommentSerializer()


class CommentListEnvelopeSerializer(serializers.Serializer):
    comments = CommentSerializer(many=True)


class PostActionEnvelopeSerializer(serializers.Serializer):
    created = serializers.BooleanField(required=False)
    removed = serializers.BooleanField(required=False)
    post = PostSerializer()


class CommentActionEnvelopeSerializer(serializers.Serializer):
    created = serializers.BooleanField(required=False)
    removed = serializers.BooleanField(required=False)
    comment = CommentSerializer()


class ShareEnvelopeSerializer(serializers.Serializer):
    created = serializers.BooleanField()
    post = PostSerializer()
