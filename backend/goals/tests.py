from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Goal, GoalMember


class GoalApiTests(APITestCase):
    password = 'StrongGoalPassword2026!'

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

    def test_create_list_and_update_solo_goal(self):
        owner = self.create_user('owner@example.com')
        authorization = self.auth(owner)

        create_response = self.client.post(
            reverse('goals-list'),
            {
                'title': 'Run 5km every morning',
                'description': 'Build a consistent morning routine.',
                'category': 'Fitness',
                'goal_type': 'solo',
                'stake_points': 200,
                'schedule_label': 'Daily · 7:00 AM',
                'cover_color': 'bg-primary',
            },
            format='json',
            HTTP_AUTHORIZATION=authorization,
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        goal = create_response.data['goal']
        self.assertEqual(goal['title'], 'Run 5km every morning')
        self.assertEqual(goal['owner_id'], owner.id)
        self.assertEqual(goal['member_count'], 1)
        self.assertEqual(goal['members'][0]['role'], GoalMember.Role.OWNER)

        list_response = self.client.get(
            reverse('goals-list'),
            HTTP_AUTHORIZATION=authorization,
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data['goals']), 1)

        update_response = self.client.patch(
            reverse('goals-detail', kwargs={'goal_id': goal['id']}),
            {'progress': 50, 'status': Goal.Status.ACTIVE},
            format='json',
            HTTP_AUTHORIZATION=authorization,
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['goal']['progress'], 50)

    def test_create_group_goal_visible_to_member(self):
        owner = self.create_user('group-owner@example.com')
        member = self.create_user('goal-member@example.com')
        owner_auth = self.auth(owner)
        member_auth = self.auth(member)

        create_response = self.client.post(
            reverse('goals-list'),
            {
                'title': 'Ship portfolio update',
                'goal_type': 'group',
                'stake_points': 320,
                'members': [
                    {'user_id': member.id, 'role': GoalMember.Role.MEMBER},
                ],
            },
            format='json',
            HTTP_AUTHORIZATION=owner_auth,
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        goal_id = create_response.data['goal']['id']
        self.assertEqual(create_response.data['goal']['member_count'], 2)

        member_detail = self.client.get(
            reverse('goals-detail', kwargs={'goal_id': goal_id}),
            HTTP_AUTHORIZATION=member_auth,
        )
        self.assertEqual(member_detail.status_code, status.HTTP_200_OK)
        self.assertEqual(member_detail.data['goal']['id'], goal_id)

        forbidden_update = self.client.patch(
            reverse('goals-detail', kwargs={'goal_id': goal_id}),
            {'title': 'Changed by member'},
            format='json',
            HTTP_AUTHORIZATION=member_auth,
        )
        self.assertEqual(forbidden_update.status_code, status.HTTP_403_FORBIDDEN)

    def test_solo_goal_rejects_members(self):
        owner = self.create_user('solo-owner@example.com')
        member = self.create_user('solo-member@example.com')

        response = self.client.post(
            reverse('goals-list'),
            {
                'title': 'Read 20 pages',
                'goal_type': 'solo',
                'members': [{'user_id': member.id}],
            },
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_requires_owner(self):
        owner = self.create_user('delete-owner@example.com')
        member = self.create_user('delete-member@example.com')
        goal = Goal.objects.create(owner=owner, title='Delete me', goal_type=Goal.GoalType.GROUP)
        GoalMember.objects.create(goal=goal, user=owner, role=GoalMember.Role.OWNER)
        GoalMember.objects.create(goal=goal, user=member, role=GoalMember.Role.MEMBER)

        forbidden = self.client.delete(
            reverse('goals-detail', kwargs={'goal_id': goal.id}),
            HTTP_AUTHORIZATION=self.auth(member),
        )
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

        deleted = self.client.delete(
            reverse('goals-detail', kwargs={'goal_id': goal.id}),
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Goal.objects.filter(id=goal.id).exists())
