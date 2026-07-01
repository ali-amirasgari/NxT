from django.urls import path

from .views import GoalDetailView, GoalDiscoverView, GoalListCreateView

root_urlpatterns = [
    path('', GoalListCreateView.as_view(), name='goals-list-no-slash'),
]

urlpatterns = [
    path('', GoalListCreateView.as_view(), name='goals-list'),
    path('discover', GoalDiscoverView.as_view(), name='goals-discover-no-slash'),
    path('discover/', GoalDiscoverView.as_view(), name='goals-discover'),
    path('<int:goal_id>', GoalDetailView.as_view(), name='goals-detail-no-slash'),
    path('<int:goal_id>/', GoalDetailView.as_view(), name='goals-detail'),
]
