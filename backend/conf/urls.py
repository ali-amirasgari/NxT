"""
URL configuration for conf project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from users.views import (
    FollowersListView,
    FollowingListView,
    FollowView,
    MeView,
    UserDetailView,
    UserListView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # OpenAPI schema + interactive docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/auth/', include('users.urls')),
    path('auth/', include('users.urls')),
    path('users/me', MeView.as_view(), name='users-me-no-slash'),
    path('users/me/', MeView.as_view(), name='users-me'),
    path('users', UserListView.as_view(), name='users-list-no-slash'),
    path('users/', UserListView.as_view(), name='users-list'),
    path('users/<int:user_id>/follow', FollowView.as_view(), name='users-follow-no-slash'),
    path('users/<int:user_id>/follow/', FollowView.as_view(), name='users-follow'),
    path('users/<int:user_id>/followers', FollowersListView.as_view(), name='users-followers-no-slash'),
    path('users/<int:user_id>/followers/', FollowersListView.as_view(), name='users-followers'),
    path('users/<int:user_id>/following', FollowingListView.as_view(), name='users-following-no-slash'),
    path('users/<int:user_id>/following/', FollowingListView.as_view(), name='users-following'),
    path('users/<int:user_id>', UserDetailView.as_view(), name='users-detail-no-slash'),
    path('users/<int:user_id>/', UserDetailView.as_view(), name='users-detail'),
]
