from django.urls import path

from .views import (
    GoalAcceptView,
    GoalCoverView,
    GoalDeclineView,
    GoalDetailView,
    GoalDiscoverView,
    GoalListCreateView,
    GoalProofView,
    ProofReviewView,
)

root_urlpatterns = [
    path('', GoalListCreateView.as_view(), name='goals-list-no-slash'),
]

urlpatterns = [
    path('', GoalListCreateView.as_view(), name='goals-list'),
    path('discover', GoalDiscoverView.as_view(), name='goals-discover-no-slash'),
    path('discover/', GoalDiscoverView.as_view(), name='goals-discover'),
    path('proofs/<int:proof_id>/review', ProofReviewView.as_view(), name='goal-proof-review-no-slash'),
    path('proofs/<int:proof_id>/review/', ProofReviewView.as_view(), name='goal-proof-review'),
    path('<int:goal_id>/proof', GoalProofView.as_view(), name='goal-proof-no-slash'),
    path('<int:goal_id>/proof/', GoalProofView.as_view(), name='goal-proof'),
    path('<int:goal_id>/accept', GoalAcceptView.as_view(), name='goal-accept-no-slash'),
    path('<int:goal_id>/accept/', GoalAcceptView.as_view(), name='goal-accept'),
    path('<int:goal_id>/cover', GoalCoverView.as_view(), name='goal-cover-no-slash'),
    path('<int:goal_id>/cover/', GoalCoverView.as_view(), name='goal-cover'),
    path('<int:goal_id>/decline', GoalDeclineView.as_view(), name='goal-decline-no-slash'),
    path('<int:goal_id>/decline/', GoalDeclineView.as_view(), name='goal-decline'),
    path('<int:goal_id>', GoalDetailView.as_view(), name='goals-detail-no-slash'),
    path('<int:goal_id>/', GoalDetailView.as_view(), name='goals-detail'),
]
