from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from wallet.models import Wallet
from wallet.signals import signup_points_grant

from .models import Goal, GoalMember
from .services import settle_goal

SIGNUP_POINTS_GRANT = signup_points_grant()


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


class GoalStakingTests(APITestCase):
    """The Commit -> Resolve economic loop: hold on commit, pool payout on settle."""

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
        return f"Bearer {response.data['access_token']}"

    def points(self, user):
        wallet = Wallet.objects.get(user=user, kind=Wallet.Kind.POINTS)
        return int(wallet.available_balance), int(wallet.held_balance)

    def test_new_user_receives_signup_points_grant(self):
        user = self.create_user('grant@example.com')
        available, held = self.points(user)
        self.assertEqual(available, SIGNUP_POINTS_GRANT)
        self.assertEqual(held, 0)

    def test_creating_staked_goal_holds_points(self):
        owner = self.create_user('staker@example.com')

        response = self.client.post(
            reverse('goals-list'),
            {'title': 'Meditate daily', 'goal_type': 'solo', 'stake_points': 200},
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        available, held = self.points(owner)
        self.assertEqual(available, SIGNUP_POINTS_GRANT - 200)
        self.assertEqual(held, 200)

    def test_stake_beyond_balance_is_rejected_and_rolls_back(self):
        owner = self.create_user('broke@example.com')

        response = self.client.post(
            reverse('goals-list'),
            {'title': 'Impossible stake', 'goal_type': 'solo',
             'stake_points': SIGNUP_POINTS_GRANT + 500},
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Goal creation rolled back entirely; balance untouched.
        self.assertEqual(Goal.objects.filter(owner=owner).count(), 0)
        self.assertEqual(self.points(owner), (SIGNUP_POINTS_GRANT, 0))

    def test_settle_group_goal_winner_takes_losers_stake(self):
        owner = self.create_user('winner@example.com')
        member = self.create_user('loser@example.com')

        create = self.client.post(
            reverse('goals-list'),
            {
                'title': 'Ship the MVP',
                'goal_type': 'group',
                'stake_points': 300,
                'members': [{'user_id': member.id, 'role': GoalMember.Role.MEMBER}],
            },
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        goal = Goal.objects.get(pk=create.data['goal']['id'])

        # Only the owner is staked at creation; the invited member must accept.
        self.assertEqual(self.points(owner), (SIGNUP_POINTS_GRANT - 300, 300))
        self.assertEqual(self.points(member), (SIGNUP_POINTS_GRANT, 0))
        self.client.post(
            reverse('goal-accept', kwargs={'goal_id': goal.id}),
            HTTP_AUTHORIZATION=self.auth(member),
        )
        self.assertEqual(self.points(member), (SIGNUP_POINTS_GRANT - 300, 300))

        # Owner proves, member does not.
        GoalMember.objects.filter(goal=goal, user=owner).update(
            outcome=GoalMember.Outcome.SUCCEEDED)
        GoalMember.objects.filter(goal=goal, user=member).update(
            outcome=GoalMember.Outcome.FAILED)

        result = settle_goal(goal)
        self.assertEqual(result['winners'], 1)
        self.assertEqual(result['losers'], 1)
        self.assertEqual(result['pool'], 300)
        self.assertEqual(result['reward_share'], 300)

        # Winner: stake back (1000) + pool (300) = 1300, nothing held.
        self.assertEqual(self.points(owner), (SIGNUP_POINTS_GRANT + 300, 0))
        # Loser: forfeited the 300 stake, nothing held.
        self.assertEqual(self.points(member), (SIGNUP_POINTS_GRANT - 300, 0))

        goal.refresh_from_db()
        self.assertEqual(goal.status, Goal.Status.COMPLETED)

    def test_unproven_member_counts_as_failed(self):
        owner = self.create_user('noproof@example.com')

        create = self.client.post(
            reverse('goals-list'),
            {'title': 'No proof submitted', 'goal_type': 'solo', 'stake_points': 150},
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        goal = Goal.objects.get(pk=create.data['goal']['id'])

        # Owner never proves -> still COMMITTED at settle -> treated as failed.
        result = settle_goal(goal)
        self.assertEqual(result['losers'], 1)
        self.assertEqual(result['winners'], 0)
        self.assertEqual(self.points(owner), (SIGNUP_POINTS_GRANT - 150, 0))

    def test_settle_is_idempotent(self):
        owner = self.create_user('idem-win@example.com')
        member = self.create_user('idem-lose@example.com')

        create = self.client.post(
            reverse('goals-list'),
            {
                'title': 'Idempotent settle',
                'goal_type': 'group',
                'stake_points': 100,
                'members': [{'user_id': member.id}],
            },
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        goal = Goal.objects.get(pk=create.data['goal']['id'])
        self.client.post(
            reverse('goal-accept', kwargs={'goal_id': goal.id}),
            HTTP_AUTHORIZATION=self.auth(member),
        )
        GoalMember.objects.filter(goal=goal, user=owner).update(
            outcome=GoalMember.Outcome.SUCCEEDED)
        GoalMember.objects.filter(goal=goal, user=member).update(
            outcome=GoalMember.Outcome.FAILED)

        settle_goal(goal)
        first = (self.points(owner), self.points(member))
        # Running again (e.g. a retried cron) must not double-pay.
        settle_goal(goal)
        second = (self.points(owner), self.points(member))
        self.assertEqual(first, second)
        self.assertEqual(self.points(owner), (SIGNUP_POINTS_GRANT + 100, 0))


class GroupProofTests(APITestCase):
    """Group goals resolve through peer-reviewed proofs (majority approve)."""

    password = 'StrongGoalPassword2026!'

    def create_user(self, email):
        User = get_user_model()
        return User.objects.create_user(username=email, email=email, password=self.password)

    def auth(self, user):
        response = self.client.post(
            reverse('auth-login'),
            {'email': user.email, 'password': self.password},
            format='json',
        )
        return f"Bearer {response.data['access_token']}"

    def points(self, user):
        wallet = Wallet.objects.get(user=user, kind=Wallet.Kind.POINTS)
        return int(wallet.available_balance), int(wallet.held_balance)

    def media(self, name='proof.jpg'):
        return SimpleUploadedFile(name, b'fake-image-bytes', content_type='image/jpeg')

    def submit_proof(self, goal_id, user):
        return self.client.post(
            reverse('goal-proof', kwargs={'goal_id': goal_id}),
            {'media': self.media(), 'note': 'done'},
            format='multipart',
            HTTP_AUTHORIZATION=self.auth(user),
        )

    def review(self, proof_id, reviewer, vote):
        return self.client.post(
            reverse('goal-proof-review', kwargs={'proof_id': proof_id}),
            {'vote': vote},
            format='json',
            HTTP_AUTHORIZATION=self.auth(reviewer),
        )

    def accept(self, goal_id, user):
        return self.client.post(
            reverse('goal-accept', kwargs={'goal_id': goal_id}),
            HTTP_AUTHORIZATION=self.auth(user),
        )

    def decline(self, goal_id, user):
        return self.client.post(
            reverse('goal-decline', kwargs={'goal_id': goal_id}),
            HTTP_AUTHORIZATION=self.auth(user),
        )

    def make_group_goal(self, owner, members, stake=100):
        create = self.client.post(
            reverse('goals-list'),
            {
                'title': 'Group challenge',
                'goal_type': 'group',
                'stake_points': stake,
                'members': [{'user_id': m.id} for m in members],
            },
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        return create.data['goal']['id']

    def test_full_group_flow_pool_paid_to_approved_members(self):
        owner = self.create_user('g-owner@example.com')
        m1 = self.create_user('g-m1@example.com')
        m2 = self.create_user('g-m2@example.com')
        goal_id = self.make_group_goal(owner, [m1, m2], stake=100)

        # Only the owner is staked until the invitees accept.
        self.assertEqual(self.points(owner), (SIGNUP_POINTS_GRANT - 100, 100))
        self.assertEqual(self.points(m1), (SIGNUP_POINTS_GRANT, 0))
        self.accept(goal_id, m1)
        self.accept(goal_id, m2)
        for u in (owner, m1, m2):
            self.assertEqual(self.points(u), (SIGNUP_POINTS_GRANT - 100, 100))

        # Owner proves and both others approve -> owner succeeds.
        p_owner = self.submit_proof(goal_id, owner).data['id']
        self.review(p_owner, m1, 'approve')
        self.review(p_owner, m2, 'approve')

        # m1 proves but owner rejects -> majority approve unreachable -> fails.
        p_m1 = self.submit_proof(goal_id, m1).data['id']
        self.review(p_m1, owner, 'reject')

        # m2 proves, owner + m1 approve -> succeeds and completes the goal.
        p_m2 = self.submit_proof(goal_id, m2).data['id']
        self.review(p_m2, owner, 'approve')
        last = self.review(p_m2, m1, 'approve')
        self.assertTrue(last.data['settled'])

        # Pool = m1's forfeited 100, split between the two winners (50 each).
        self.assertEqual(self.points(owner), (SIGNUP_POINTS_GRANT + 50, 0))
        self.assertEqual(self.points(m2), (SIGNUP_POINTS_GRANT + 50, 0))
        self.assertEqual(self.points(m1), (SIGNUP_POINTS_GRANT - 100, 0))

        self.assertEqual(Goal.objects.get(pk=goal_id).status, Goal.Status.COMPLETED)

    def test_you_cannot_review_your_own_proof(self):
        owner = self.create_user('self-owner@example.com')
        m1 = self.create_user('self-m1@example.com')
        goal_id = self.make_group_goal(owner, [m1])
        proof_id = self.submit_proof(goal_id, owner).data['id']

        response = self.review(proof_id, owner, 'approve')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_solo_goal_rejects_proof_submission(self):
        owner = self.create_user('solo-proof@example.com')
        create = self.client.post(
            reverse('goals-list'),
            {'title': 'Solo goal', 'goal_type': 'solo', 'stake_points': 50},
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        goal_id = create.data['goal']['id']

        response = self.submit_proof(goal_id, owner)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_solo_self_report_completion_releases_stake(self):
        owner = self.create_user('solo-done@example.com')
        create = self.client.post(
            reverse('goals-list'),
            {'title': 'Solo goal', 'goal_type': 'solo', 'stake_points': 150},
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        goal_id = create.data['goal']['id']
        self.assertEqual(self.points(owner), (SIGNUP_POINTS_GRANT - 150, 150))

        done = self.client.patch(
            reverse('goals-detail', kwargs={'goal_id': goal_id}),
            {'status': Goal.Status.COMPLETED},
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        self.assertEqual(done.status_code, status.HTTP_200_OK)
        self.assertEqual(self.points(owner), (SIGNUP_POINTS_GRANT, 0))

    def test_owner_can_upload_goal_cover_image(self):
        owner = self.create_user('cover-owner@example.com')
        create = self.client.post(
            reverse('goals-list'),
            {'title': 'Goal with cover', 'goal_type': 'solo', 'stake_points': 10},
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        goal_id = create.data['goal']['id']

        response = self.client.post(
            reverse('goal-cover', kwargs={'goal_id': goal_id}),
            {'cover_image': self.media('cover.jpg')},
            format='multipart',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['goal']['cover_image'])

    def test_group_goal_cannot_be_completed_manually(self):
        owner = self.create_user('manual-owner@example.com')
        m1 = self.create_user('manual-m1@example.com')
        goal_id = self.make_group_goal(owner, [m1])

        response = self.client.patch(
            reverse('goals-detail', kwargs={'goal_id': goal_id}),
            {'status': Goal.Status.COMPLETED},
            format='json',
            HTTP_AUTHORIZATION=self.auth(owner),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invited_member_is_not_staked_until_accept(self):
        owner = self.create_user('inv-owner@example.com')
        m1 = self.create_user('inv-m1@example.com')
        goal_id = self.make_group_goal(owner, [m1], stake=120)

        # Invited, nothing held — points are never taken without consent.
        self.assertEqual(self.points(m1), (SIGNUP_POINTS_GRANT, 0))

        accepted = self.accept(goal_id, m1)
        self.assertEqual(accepted.status_code, status.HTTP_200_OK)
        self.assertEqual(self.points(m1), (SIGNUP_POINTS_GRANT - 120, 120))

    def test_cannot_submit_proof_before_accepting(self):
        owner = self.create_user('pre-owner@example.com')
        m1 = self.create_user('pre-m1@example.com')
        goal_id = self.make_group_goal(owner, [m1])

        response = self.submit_proof(goal_id, m1)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_decline_keeps_points_and_blocks_participation(self):
        owner = self.create_user('dec-owner@example.com')
        m1 = self.create_user('dec-m1@example.com')
        goal_id = self.make_group_goal(owner, [m1], stake=90)

        declined = self.decline(goal_id, m1)
        self.assertEqual(declined.status_code, status.HTTP_200_OK)
        self.assertEqual(self.points(m1), (SIGNUP_POINTS_GRANT, 0))
        # A declined member cannot then accept and stake.
        self.assertEqual(self.submit_proof(goal_id, m1).status_code, status.HTTP_403_FORBIDDEN)
