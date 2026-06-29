from django.urls import path

from .views import GoalDetailView, GoalListCreateView

root_urlpatterns = [
    path('', GoalListCreateView.as_view(), name='goals-list-no-slash'),
]

urlpatterns = [
    path('', GoalListCreateView.as_view(), name='goals-list'),
    path('<int:goal_id>', GoalDetailView.as_view(), name='goals-detail-no-slash'),
    path('<int:goal_id>/', GoalDetailView.as_view(), name='goals-detail'),
]
