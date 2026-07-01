from django.urls import path

from .views import EventDetailView, EventListCreateView, EventRsvpView

root_urlpatterns = [
    path('', EventListCreateView.as_view(), name='events-list-no-slash'),
]

urlpatterns = [
    path('', EventListCreateView.as_view(), name='events-list'),
    path('<int:event_id>', EventDetailView.as_view(), name='events-detail-no-slash'),
    path('<int:event_id>/', EventDetailView.as_view(), name='events-detail'),
    path('<int:event_id>/rsvp', EventRsvpView.as_view(), name='events-rsvp-no-slash'),
    path('<int:event_id>/rsvp/', EventRsvpView.as_view(), name='events-rsvp'),
]
