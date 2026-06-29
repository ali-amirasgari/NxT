from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import Count, Exists, OuterRef, Q
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import Follow

from social.models import Comment, CommentLike, Post, PostLike, PostSave, PostShare
from social.serializers import (
    CommentActionEnvelopeSerializer,
    CommentCreateSerializer,
    CommentEnvelopeSerializer,
    CommentListEnvelopeSerializer,
    PostActionEnvelopeSerializer,
    PostCreateUpdateSerializer,
    PostEnvelopeSerializer,
    PostListEnvelopeSerializer,
    ShareCreateSerializer,
    ShareEnvelopeSerializer,
)

User = get_user_model()


def visible_post_filter(user):
    following_ids = Follow.objects.filter(follower=user).values('following_id')
    return (
        Q(author=user)
        | Q(visibility=Post.Visibility.PUBLIC)
        | Q(visibility=Post.Visibility.FOLLOWERS, author_id__in=following_ids)
    )


def post_queryset_for(user):
    return (
        Post.objects.filter(visible_post_filter(user))
        .select_related('author', 'goal')
        .annotate(
            likes_count=Count('likes', distinct=True),
            comments_count=Count('comments', distinct=True),
            saves_count=Count('saves', distinct=True),
            shares_count=Count('shares', distinct=True),
            is_liked=Exists(PostLike.objects.filter(post=OuterRef('pk'), user=user)),
            is_saved=Exists(PostSave.objects.filter(post=OuterRef('pk'), user=user)),
        )
        .distinct()
    )


def comment_queryset_for(user):
    return (
        Comment.objects.select_related('author', 'post', 'parent')
        .annotate(
            likes_count=Count('likes', distinct=True),
            is_liked=Exists(CommentLike.objects.filter(comment=OuterRef('pk'), user=user)),
        )
    )


def get_visible_post_or_404(user, post_id):
    try:
        return post_queryset_for(user).get(id=post_id)
    except Post.DoesNotExist:
        raise NotFound('Post not found.')


def post_payload(post, request):
    return PostEnvelopeSerializer({'post': post}, context={'request': request}).data


def comment_payload(comment, request):
    return CommentEnvelopeSerializer(
        {'comment': comment},
        context={'request': request},
    ).data


class PostListCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Social'],
        operation_id='posts_list',
        summary='List visible posts',
        parameters=[
            OpenApiParameter('author_id', int, description='Filter by author id.'),
            OpenApiParameter('goal_id', int, description='Filter by goal id.'),
            OpenApiParameter('search', str, description='Filter title/caption.'),
            OpenApiParameter('limit', int, description='Maximum posts, capped at 100.'),
        ],
        responses=PostListEnvelopeSerializer,
    )
    def get(self, request):
        posts = post_queryset_for(request.user)
        author_id = request.query_params.get('author_id')
        goal_id = request.query_params.get('goal_id')
        search = request.query_params.get('search', '').strip()
        raw_limit = request.query_params.get('limit', '50')

        if author_id and author_id.isdigit():
            posts = posts.filter(author_id=author_id)
        if goal_id and goal_id.isdigit():
            posts = posts.filter(goal_id=goal_id)
        if search:
            posts = posts.filter(Q(title__icontains=search) | Q(caption__icontains=search))
        try:
            limit = min(max(int(raw_limit), 1), 100)
        except ValueError:
            limit = 50

        return Response(
            PostListEnvelopeSerializer(
                {'posts': posts[:limit]},
                context={'request': request},
            ).data
        )

    @extend_schema(
        tags=['Social'],
        operation_id='posts_create',
        summary='Create a post',
        request=PostCreateUpdateSerializer,
        responses={201: PostEnvelopeSerializer},
    )
    def post(self, request):
        serializer = PostCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user)
        fresh = post_queryset_for(request.user).get(pk=post.pk)
        return Response(post_payload(fresh, request), status=status.HTTP_201_CREATED)


class PostDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(tags=['Social'], operation_id='posts_detail', responses=PostEnvelopeSerializer)
    def get(self, request, post_id):
        post = get_visible_post_or_404(request.user, post_id)
        return Response(post_payload(post, request))

    @extend_schema(
        tags=['Social'],
        operation_id='posts_update',
        request=PostCreateUpdateSerializer,
        responses=PostEnvelopeSerializer,
    )
    def patch(self, request, post_id):
        post = get_visible_post_or_404(request.user, post_id)
        if post.author_id != request.user.id:
            raise PermissionDenied('Only the author can update this post.')
        serializer = PostCreateUpdateSerializer(post, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        fresh = post_queryset_for(request.user).get(pk=post.pk)
        return Response(post_payload(fresh, request))

    @extend_schema(tags=['Social'], operation_id='posts_delete', responses={204: None})
    def delete(self, request, post_id):
        post = get_visible_post_or_404(request.user, post_id)
        if post.author_id != request.user.id:
            raise PermissionDenied('Only the author can delete this post.')
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostLikeView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(tags=['Social'], operation_id='posts_like', request=None, responses=PostActionEnvelopeSerializer)
    def post(self, request, post_id):
        post = get_visible_post_or_404(request.user, post_id)
        _, created = PostLike.objects.get_or_create(post_id=post.id, user=request.user)
        fresh = post_queryset_for(request.user).get(pk=post.id)
        return Response({'created': created, **post_payload(fresh, request)})

    @extend_schema(tags=['Social'], operation_id='posts_unlike', request=None, responses=PostActionEnvelopeSerializer)
    def delete(self, request, post_id):
        post = get_visible_post_or_404(request.user, post_id)
        removed, _ = PostLike.objects.filter(post_id=post.id, user=request.user).delete()
        fresh = post_queryset_for(request.user).get(pk=post.id)
        return Response({'removed': bool(removed), **post_payload(fresh, request)})


class PostSaveView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(tags=['Social'], operation_id='posts_save', request=None, responses=PostActionEnvelopeSerializer)
    def post(self, request, post_id):
        post = get_visible_post_or_404(request.user, post_id)
        _, created = PostSave.objects.get_or_create(post_id=post.id, user=request.user)
        fresh = post_queryset_for(request.user).get(pk=post.id)
        return Response({'created': created, **post_payload(fresh, request)})

    @extend_schema(tags=['Social'], operation_id='posts_unsave', request=None, responses=PostActionEnvelopeSerializer)
    def delete(self, request, post_id):
        post = get_visible_post_or_404(request.user, post_id)
        removed, _ = PostSave.objects.filter(post_id=post.id, user=request.user).delete()
        fresh = post_queryset_for(request.user).get(pk=post.id)
        return Response({'removed': bool(removed), **post_payload(fresh, request)})


class PostShareView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Social'],
        operation_id='posts_share',
        request=ShareCreateSerializer,
        responses={201: ShareEnvelopeSerializer},
    )
    def post(self, request, post_id):
        post = get_visible_post_or_404(request.user, post_id)
        serializer = ShareCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target = None
        target_user_id = serializer.validated_data.get('target_user_id')
        if target_user_id:
            target = User.objects.filter(id=target_user_id, is_active=True).first()
        PostShare.objects.create(
            post_id=post.id,
            user=request.user,
            target_user=target,
            channel=serializer.validated_data['channel'],
        )
        fresh = post_queryset_for(request.user).get(pk=post.id)
        return Response({'created': True, **post_payload(fresh, request)}, status=status.HTTP_201_CREATED)


class PostCommentsView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(tags=['Social'], operation_id='comments_list', responses=CommentListEnvelopeSerializer)
    def get(self, request, post_id):
        post = get_visible_post_or_404(request.user, post_id)
        comments = comment_queryset_for(request.user).filter(post_id=post.id, parent__isnull=True)
        return Response(
            CommentListEnvelopeSerializer(
                {'comments': comments[:200]},
                context={'request': request},
            ).data
        )

    @extend_schema(
        tags=['Social'],
        operation_id='comments_create',
        request=CommentCreateSerializer,
        responses={201: CommentEnvelopeSerializer},
    )
    def post(self, request, post_id):
        post = get_visible_post_or_404(request.user, post_id)
        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        parent = None
        parent_id = serializer.validated_data.get('parent_id')
        if parent_id:
            parent = Comment.objects.filter(id=parent_id, post=post).first()
            if parent is None:
                raise NotFound('Parent comment not found.')
        comment = Comment.objects.create(
            post=post,
            author=request.user,
            parent=parent,
            body=serializer.validated_data['body'],
        )
        fresh = comment_queryset_for(request.user).get(pk=comment.pk)
        return Response(comment_payload(fresh, request), status=status.HTTP_201_CREATED)


class CommentDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(tags=['Social'], operation_id='comments_delete', responses={204: None})
    def delete(self, request, comment_id):
        try:
            comment = Comment.objects.select_related('post').get(id=comment_id)
        except Comment.DoesNotExist:
            raise NotFound('Comment not found.')
        get_visible_post_or_404(request.user, comment.post_id)
        if comment.author_id != request.user.id and comment.post.author_id != request.user.id:
            raise PermissionDenied('Only the comment author or post author can delete this comment.')
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentLikeView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(tags=['Social'], operation_id='comments_like', request=None, responses=CommentActionEnvelopeSerializer)
    def post(self, request, comment_id):
        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            raise NotFound('Comment not found.')
        get_visible_post_or_404(request.user, comment.post_id)
        _, created = CommentLike.objects.get_or_create(comment_id=comment.id, user=request.user)
        fresh = comment_queryset_for(request.user).get(pk=comment.id)
        return Response({'created': created, **comment_payload(fresh, request)})

    @extend_schema(tags=['Social'], operation_id='comments_unlike', request=None, responses=CommentActionEnvelopeSerializer)
    def delete(self, request, comment_id):
        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            raise NotFound('Comment not found.')
        get_visible_post_or_404(request.user, comment.post_id)
        removed, _ = CommentLike.objects.filter(comment_id=comment.id, user=request.user).delete()
        fresh = comment_queryset_for(request.user).get(pk=comment.id)
        return Response({'removed': bool(removed), **comment_payload(fresh, request)})


class FeedView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(tags=['Social'], operation_id='feed_list', responses=PostListEnvelopeSerializer)
    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values('following_id')
        posts = post_queryset_for(request.user).filter(Q(author=request.user) | Q(author_id__in=following_ids))
        return Response(PostListEnvelopeSerializer({'posts': posts[:50]}, context={'request': request}).data)


class ExploreView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Social'],
        operation_id='explore_list',
        parameters=[
            OpenApiParameter('category', str, description='Filter by goal/post category.'),
        ],
        responses=PostListEnvelopeSerializer,
    )
    def get(self, request):
        category = request.query_params.get('category', '').strip()
        posts = post_queryset_for(request.user).filter(visibility=Post.Visibility.PUBLIC)
        if category and category != 'for-you':
            posts = posts.filter(Q(goal__category__iexact=category) | Q(title__icontains=category))
        return Response(PostListEnvelopeSerializer({'posts': posts[:60]}, context={'request': request}).data)


class ExploreSearchView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=['Social'],
        operation_id='explore_search',
        parameters=[
            OpenApiParameter('q', str, description='Search query.'),
        ],
        responses=PostListEnvelopeSerializer,
    )
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        posts = post_queryset_for(request.user).filter(visibility=Post.Visibility.PUBLIC)
        if query:
            posts = posts.filter(
                Q(title__icontains=query)
                | Q(caption__icontains=query)
                | Q(author__username__icontains=query)
                | Q(author__display_name__icontains=query)
                | Q(goal__title__icontains=query)
            )
        return Response(PostListEnvelopeSerializer({'posts': posts[:50]}, context={'request': request}).data)
