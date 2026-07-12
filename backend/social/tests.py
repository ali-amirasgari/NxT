from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import Follow

from .models import Comment, Post


class SocialApiTests(APITestCase):
    password = 'StrongSocialPassword2026!'

    def create_user(self, email):
        User = get_user_model()
        return User.objects.create_user(
            username=email,
            email=email,
            password=self.password,
        )

    def auth(self, user):
        response = self.client.post(
            reverse('auth-login'),
            {'email': user.email, 'password': self.password},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return f"Bearer {response.data['access_token']}"

    def test_post_without_media_is_rejected(self):
        author = self.create_user('nomedia@example.com')
        response = self.client.post(
            reverse('posts-list'),
            {'title': 'No media', 'caption': 'x', 'visibility': Post.Visibility.PUBLIC},
            format='json',
            HTTP_AUTHORIZATION=self.auth(author),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_like_comment_and_save_post(self):
        author = self.create_user('author@example.com')
        viewer = self.create_user('viewer@example.com')

        create_response = self.client.post(
            reverse('posts-list'),
            {
                'title': 'Morning run complete',
                'caption': '5km before breakfast.',
                'visibility': Post.Visibility.PUBLIC,
                'media': SimpleUploadedFile('run.jpg', b'img-bytes', content_type='image/jpeg'),
            },
            format='multipart',
            HTTP_AUTHORIZATION=self.auth(author),
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        post_id = create_response.data['post']['id']
        # media_type is inferred from the uploaded file.
        self.assertEqual(create_response.data['post']['media_type'], Post.MediaType.IMAGE)

        like_response = self.client.post(
            reverse('posts-like', kwargs={'post_id': post_id}),
            HTTP_AUTHORIZATION=self.auth(viewer),
        )
        comment_response = self.client.post(
            reverse('post-comments', kwargs={'post_id': post_id}),
            {'body': 'Strong finish.'},
            format='json',
            HTTP_AUTHORIZATION=self.auth(viewer),
        )
        save_response = self.client.post(
            reverse('posts-save', kwargs={'post_id': post_id}),
            HTTP_AUTHORIZATION=self.auth(viewer),
        )

        self.assertEqual(like_response.status_code, status.HTTP_200_OK)
        self.assertTrue(like_response.data['created'])
        self.assertEqual(comment_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(save_response.status_code, status.HTTP_200_OK)
        self.assertEqual(like_response.data['post']['likes_count'], 1)

    def test_non_author_cannot_update_post(self):
        author = self.create_user('owner@example.com')
        other = self.create_user('other@example.com')
        post = Post.objects.create(author=author, title='Owned post')

        response = self.client.patch(
            reverse('posts-detail', kwargs={'post_id': post.id}),
            {'title': 'Changed'},
            format='json',
            HTTP_AUTHORIZATION=self.auth(other),
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_feed_includes_followed_author_posts(self):
        viewer = self.create_user('feed-viewer@example.com')
        author = self.create_user('feed-author@example.com')
        Follow.objects.create(follower=viewer, following=author)
        Post.objects.create(author=author, title='Visible post', visibility=Post.Visibility.FOLLOWERS)

        response = self.client.get(reverse('feed-list'), HTTP_AUTHORIZATION=self.auth(viewer))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['posts']), 1)

    def test_comment_author_or_post_author_can_delete_comment(self):
        author = self.create_user('post-owner@example.com')
        commenter = self.create_user('commenter@example.com')
        post = Post.objects.create(author=author, title='Post')
        comment = Comment.objects.create(post=post, author=commenter, body='Comment')

        response = self.client.delete(
            reverse('comments-detail', kwargs={'comment_id': comment.id}),
            HTTP_AUTHORIZATION=self.auth(author),
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
