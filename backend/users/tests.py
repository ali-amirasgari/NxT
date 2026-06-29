from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class AuthFlowTests(APITestCase):
    email = 'auth-flow@example.com'
    password = 'StrongAuthPassword2026!'

    def register(self):
        return self.client.post(
            reverse('auth-register'),
            {
                'email': self.email,
                'password': self.password,
                'confirmPassword': self.password,
            },
            format='json',
        )

    def test_register_login_and_session(self):
        register_response = self.register()

        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access_token', register_response.data)
        self.assertIn('refresh_token', register_response.data)

        login_response = self.client.post(
            reverse('auth-login'),
            {'email': self.email, 'password': self.password},
            format='json',
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.data['user']['email'], self.email)

        session_response = self.client.get(
            '/users/me',
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access_token']}",
        )

        self.assertEqual(session_response.status_code, status.HTTP_200_OK)
        self.assertEqual(session_response.data['user']['email'], self.email)
        # Profile fields are part of the payload contract.
        self.assertIn('display_name', session_response.data['user'])
        self.assertIn('avatar_url', session_response.data['user'])

    def test_logout_blacklists_refresh_token(self):
        register_response = self.register()
        refresh_token = register_response.data['refresh_token']

        logout_response = self.client.post(
            reverse('auth-logout'),
            {'refresh_token': refresh_token},
            format='json',
        )

        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)

        refresh_response = self.client.post(
            reverse('auth-refresh'),
            {'refresh_token': refresh_token},
            format='json',
        )

        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_by_email_when_username_differs(self):
        # Mirrors a createsuperuser account: username != email.
        User = get_user_model()
        User.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password=self.password,
        )

        by_email = self.client.post(
            reverse('auth-login'),
            {'email': 'admin@example.com', 'password': self.password},
            format='json',
        )
        by_username = self.client.post(
            reverse('auth-login'),
            {'username': 'adminuser', 'password': self.password},
            format='json',
        )

        self.assertEqual(by_email.status_code, status.HTTP_200_OK)
        self.assertEqual(by_email.data['user']['email'], 'admin@example.com')
        self.assertEqual(by_username.status_code, status.HTTP_200_OK)

    def test_update_own_profile(self):
        register_response = self.register()
        authorization = f"Bearer {register_response.data['access_token']}"

        patch_response = self.client.patch(
            '/users/me',
            {
                'display_name': 'Alex Carter',
                'bio': 'Fitness · Coding · Books.',
                'is_private': True,
                'notifications_enabled': False,
            },
            format='json',
            HTTP_AUTHORIZATION=authorization,
        )

        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data['user']['display_name'], 'Alex Carter')
        self.assertTrue(patch_response.data['user']['is_private'])
        self.assertFalse(patch_response.data['user']['notifications_enabled'])

    def test_follow_unfollow_flow(self):
        register_response = self.register()
        User = get_user_model()
        target = User.objects.create_user(
            username='followee@example.com',
            email='followee@example.com',
            password=self.password,
        )
        authorization = f"Bearer {register_response.data['access_token']}"

        follow = self.client.post(
            f'/users/{target.id}/follow',
            HTTP_AUTHORIZATION=authorization,
        )
        self.assertEqual(follow.status_code, status.HTTP_201_CREATED)
        self.assertTrue(follow.data['created'])
        self.assertTrue(follow.data['user']['is_following'])
        self.assertEqual(follow.data['user']['followers_count'], 1)

        # Idempotent re-follow.
        refollow = self.client.post(
            f'/users/{target.id}/follow',
            HTTP_AUTHORIZATION=authorization,
        )
        self.assertEqual(refollow.status_code, status.HTTP_200_OK)
        self.assertFalse(refollow.data['created'])

        following = self.client.get(
            '/users/me/following'.replace('me', str(self.actor_id(register_response))),
            HTTP_AUTHORIZATION=authorization,
        )
        self.assertEqual(following.status_code, status.HTTP_200_OK)
        self.assertEqual(following.data['users'][0]['id'], target.id)

        unfollow = self.client.delete(
            f'/users/{target.id}/follow',
            HTTP_AUTHORIZATION=authorization,
        )
        self.assertEqual(unfollow.status_code, status.HTTP_200_OK)
        self.assertTrue(unfollow.data['removed'])
        self.assertFalse(unfollow.data['user']['is_following'])
        self.assertEqual(unfollow.data['user']['followers_count'], 0)

    def test_cannot_follow_self(self):
        register_response = self.register()
        actor_id = self.actor_id(register_response)
        response = self.client.post(
            f'/users/{actor_id}/follow',
            HTTP_AUTHORIZATION=f"Bearer {register_response.data['access_token']}",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def actor_id(self, register_response):
        return register_response.data['user']['id']

    def test_authenticated_user_search_and_detail(self):
        register_response = self.register()
        User = get_user_model()
        target = User.objects.create_user(
            username='target-user@example.com',
            email='target-user@example.com',
            password=self.password,
        )
        authorization = f"Bearer {register_response.data['access_token']}"

        search_response = self.client.get(
            '/users?search=target-user',
            HTTP_AUTHORIZATION=authorization,
        )
        detail_response = self.client.get(
            f'/users/{target.id}',
            HTTP_AUTHORIZATION=authorization,
        )

        self.assertEqual(search_response.status_code, status.HTTP_200_OK)
        self.assertEqual(search_response.data['users'][0]['id'], target.id)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data['user']['email'], target.email)
