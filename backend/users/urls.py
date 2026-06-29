from django.urls import path

from .views import (
    CsrfTokenView,
    FollowersListView,
    FollowingListView,
    FollowView,
    LoginView,
    LogoutView,
    MeView,
    RefreshView,
    RegisterView,
    UserDetailView,
    UserListView,
)


auth_urlpatterns = [
    path('csrf', CsrfTokenView.as_view(), name='auth-csrf-no-slash'),
    path('csrf/', CsrfTokenView.as_view(), name='auth-csrf'),
    path('register', RegisterView.as_view(), name='auth-register-no-slash'),
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login', LoginView.as_view(), name='auth-login-no-slash'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh', RefreshView.as_view(), name='auth-refresh-no-slash'),
    path('refresh/', RefreshView.as_view(), name='auth-refresh'),
    path('logout', LogoutView.as_view(), name='auth-logout-no-slash'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me', MeView.as_view(), name='auth-me-no-slash'),
    path('me/', MeView.as_view(), name='auth-me'),
]

user_root_urlpatterns = [
    path('', UserListView.as_view(), name='users-list-no-slash'),
]

user_urlpatterns = [
    path('', UserListView.as_view(), name='users-list'),
    path('me', MeView.as_view(), name='users-me-no-slash'),
    path('me/', MeView.as_view(), name='users-me'),
    path('<int:user_id>/follow', FollowView.as_view(), name='users-follow-no-slash'),
    path('<int:user_id>/follow/', FollowView.as_view(), name='users-follow'),
    path('<int:user_id>/followers', FollowersListView.as_view(), name='users-followers-no-slash'),
    path('<int:user_id>/followers/', FollowersListView.as_view(), name='users-followers'),
    path('<int:user_id>/following', FollowingListView.as_view(), name='users-following-no-slash'),
    path('<int:user_id>/following/', FollowingListView.as_view(), name='users-following'),
    path('<int:user_id>', UserDetailView.as_view(), name='users-detail-no-slash'),
    path('<int:user_id>/', UserDetailView.as_view(), name='users-detail'),
]

urlpatterns = auth_urlpatterns
