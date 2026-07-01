from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Event, EventAttendee


class EventApiTests(APITestCase):
    password = 'StrongEventPassword2026!'

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

    def test_create_and_list_upcoming_event(self):
        host = self.create_user('host@example.com')
        authorization = self.auth(host)
        starts_at = timezone.now() + timedelta(days=3)

        create_response = self.client.post(
            reverse('events-list'),
            {
                'title': 'Q3 Goal-Setting Workshop',
                'description': 'Plan the next quarter together.',
                'tag': Event.Tag.WORKSHOP,
                'cover_color': 'bg-primary',
                'starts_at': starts_at.isoformat(),
            },
            format='json',
            HTTP_AUTHORIZATION=authorization,
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        event = create_response.data['event']
        self.assertEqual(event['title'], 'Q3 Goal-Setting Workshop')
        self.assertEqual(event['host_id'], host.id)
        self.assertEqual(event['attendee_count'], 0)
        self.assertFalse(event['is_attending'])

        list_response = self.client.get(
            reverse('events-list'),
            HTTP_AUTHORIZATION=authorization,
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data['events']), 1)

    def test_past_event_excluded_unless_requested(self):
        host = self.create_user('past-host@example.com')
        authorization = self.auth(host)
        Event.objects.create(
            host=host,
            title='Last quarter retro',
            starts_at=timezone.now() - timedelta(days=1),
        )

        upcoming_response = self.client.get(
            reverse('events-list'),
            HTTP_AUTHORIZATION=authorization,
        )
        self.assertEqual(len(upcoming_response.data['events']), 0)

        all_response = self.client.get(
            f"{reverse('events-list')}?upcoming=false",
            HTTP_AUTHORIZATION=authorization,
        )
        self.assertEqual(len(all_response.data['events']), 1)

    def test_rsvp_and_cancel_rsvp(self):
        host = self.create_user('rsvp-host@example.com')
        attendee = self.create_user('attendee@example.com')
        event = Event.objects.create(
            host=host,
            title='Team Accountability Circle',
            starts_at=timezone.now() + timedelta(days=1),
        )
        attendee_auth = self.auth(attendee)

        rsvp_response = self.client.post(
            reverse('events-rsvp', kwargs={'event_id': event.id}),
            HTTP_AUTHORIZATION=attendee_auth,
        )
        self.assertEqual(rsvp_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(rsvp_response.data['created'])
        self.assertEqual(rsvp_response.data['event']['attendee_count'], 1)
        self.assertTrue(rsvp_response.data['event']['is_attending'])

        cancel_response = self.client.delete(
            reverse('events-rsvp', kwargs={'event_id': event.id}),
            HTTP_AUTHORIZATION=attendee_auth,
        )
        self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)
        self.assertTrue(cancel_response.data['removed'])
        self.assertEqual(cancel_response.data['event']['attendee_count'], 0)
        self.assertFalse(EventAttendee.objects.filter(event=event, user=attendee).exists())

    def test_update_and_delete_require_host(self):
        host = self.create_user('owner-host@example.com')
        other = self.create_user('other-user@example.com')
        event = Event.objects.create(
            host=host,
            title='Delete me',
            starts_at=timezone.now() + timedelta(days=1),
        )

        forbidden_update = self.client.patch(
            reverse('events-detail', kwargs={'event_id': event.id}),
            {'title': 'Hijacked'},
            format='json',
            HTTP_AUTHORIZATION=self.auth(other),
        )
        self.assertEqual(forbidden_update.status_code, status.HTTP_403_FORBIDDEN)

        forbidden_delete = self.client.delete(
            reverse('events-detail', kwargs={'event_id': event.id}),
            HTTP_AUTHORIZATION=self.auth(other),
        )
        self.assertEqual(forbidden_delete.status_code, status.HTTP_403_FORBIDDEN)

        allowed_delete = self.client.delete(
            reverse('events-detail', kwargs={'event_id': event.id}),
            HTTP_AUTHORIZATION=self.auth(host),
        )
        self.assertEqual(allowed_delete.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Event.objects.filter(id=event.id).exists())
