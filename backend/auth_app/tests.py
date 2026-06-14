from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from django.contrib.auth import get_user_model
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
