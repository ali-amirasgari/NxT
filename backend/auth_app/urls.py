from django.urls import path

from .views import CsrfTokenView, LoginView, LogoutView, MeView, RefreshView, RegisterView


urlpatterns = [
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
