from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from goals import urls as goals_urls
from social import urls as social_urls
from users import urls as users_urls
from wallet import urls as wallet_urls

DOCS_URLPATTERNS = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

APP_URLPATTERNS = [
    path('api/auth/', include(users_urls.auth_urlpatterns)),
    path('auth/', include(users_urls.auth_urlpatterns)),
    path('users', include(users_urls.user_root_urlpatterns)),
    path('users/', include(users_urls.user_urlpatterns)),
    path('goals', include(goals_urls.root_urlpatterns)),
    path('goals/', include(goals_urls.urlpatterns)),
    path('wallets', include(wallet_urls.root_urlpatterns)),
    path('wallets/', include(wallet_urls.urlpatterns)),
    path('', include(social_urls.urlpatterns)),
]

urlpatterns = DOCS_URLPATTERNS + APP_URLPATTERNS
