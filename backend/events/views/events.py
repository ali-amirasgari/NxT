from __future__ import annotations

from django.db.models import Count, Exists, OuterRef, Q
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Event, EventAttendee
from ..serializers import (
    EventCreateUpdateSerializer,
    EventEnvelopeSerializer,
    EventListEnvelopeSerializer,
    EventRsvpResultSerializer,
)
from ..services import rsvp_event, unrsvp_event

EVENTS_TAGS = ['Events']


def event_queryset_for(user):
    return (
        Event.objects.select_related('host')
        .annotate(
            attendee_count=Count('attendees', distinct=True),
            is_attending=Exists(
                EventAttendee.objects.filter(event=OuterRef('pk'), user=user),
            ),
        )
        # Aggregating with Count() suppresses Event.Meta.ordering, so the
        # sort-by-start-time needs to be explicit here.
        .order_by('starts_at')
    )


def event_payload(event, request):
    return EventEnvelopeSerializer(
        {'event': event},
        context={'request': request},
    ).data


class EventListCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=EVENTS_TAGS,
        operation_id='events_list',
        summary='List events',
        parameters=[
            OpenApiParameter('status', str, description='Filter by event status.'),
            OpenApiParameter('search', str, description='Filter by title or description.'),
            OpenApiParameter(
                'upcoming',
                bool,
                description='Only future events (default true). Pass false to include past events.',
            ),
        ],
        responses=EventListEnvelopeSerializer,
    )
    def get(self, request):
        events = event_queryset_for(request.user)

        status_filter = request.query_params.get('status', '').strip()
        search = request.query_params.get('search', '').strip()
        upcoming = request.query_params.get('upcoming', 'true').strip().lower() != 'false'

        if status_filter:
            events = events.filter(status=status_filter)
        if search:
            events = events.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        if upcoming:
            events = events.filter(starts_at__gte=timezone.now())

        return Response(
            EventListEnvelopeSerializer(
                {'events': events[:100]},
                context={'request': request},
            ).data
        )

    @extend_schema(
        tags=EVENTS_TAGS,
        operation_id='events_create',
        summary='Create an event',
        request=EventCreateUpdateSerializer,
        responses={201: EventEnvelopeSerializer},
    )
    def post(self, request):
        serializer = EventCreateUpdateSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        event = serializer.save(host=request.user)
        fresh = event_queryset_for(request.user).get(pk=event.pk)
        return Response(event_payload(fresh, request), status=status.HTTP_201_CREATED)


class EventDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_event(self, request, event_id):
        try:
            return event_queryset_for(request.user).get(pk=event_id)
        except Event.DoesNotExist:
            return None

    @extend_schema(
        tags=EVENTS_TAGS,
        operation_id='events_detail',
        summary='Get an event',
        responses=EventEnvelopeSerializer,
    )
    def get(self, request, event_id):
        event = self.get_event(request, event_id)
        if event is None:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(event_payload(event, request))

    @extend_schema(
        tags=EVENTS_TAGS,
        operation_id='events_update',
        summary='Update an event hosted by the authenticated user',
        request=EventCreateUpdateSerializer,
        responses=EventEnvelopeSerializer,
    )
    def patch(self, request, event_id):
        event = self.get_event(request, event_id)
        if event is None:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        if event.host_id != request.user.id:
            raise PermissionDenied('Only the event host can update this event.')

        serializer = EventCreateUpdateSerializer(
            instance=event,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        fresh = event_queryset_for(request.user).get(pk=event.pk)
        return Response(event_payload(fresh, request))

    @extend_schema(
        tags=EVENTS_TAGS,
        operation_id='events_delete',
        summary='Delete an event hosted by the authenticated user',
        responses={204: None},
    )
    def delete(self, request, event_id):
        event = self.get_event(request, event_id)
        if event is None:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        if event.host_id != request.user.id:
            raise PermissionDenied('Only the event host can delete this event.')
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EventRsvpView(APIView):
    """POST to RSVP, DELETE to cancel the RSVP for the event at ``event_id``."""

    permission_classes = (IsAuthenticated,)

    def get_event(self, request, event_id):
        try:
            return event_queryset_for(request.user).get(pk=event_id)
        except Event.DoesNotExist:
            return None

    @extend_schema(
        tags=EVENTS_TAGS,
        operation_id='events_rsvp',
        summary='RSVP to an event',
        request=None,
        responses=EventRsvpResultSerializer,
    )
    def post(self, request, event_id):
        event = self.get_event(request, event_id)
        if event is None:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        created = rsvp_event(user=request.user, event=event)
        fresh = event_queryset_for(request.user).get(pk=event.pk)
        return Response(
            {'created': created, **event_payload(fresh, request)},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @extend_schema(
        tags=EVENTS_TAGS,
        operation_id='events_unrsvp',
        summary='Cancel an RSVP to an event',
        request=None,
        responses=EventRsvpResultSerializer,
    )
    def delete(self, request, event_id):
        event = self.get_event(request, event_id)
        if event is None:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        removed = unrsvp_event(user=request.user, event=event)
        fresh = event_queryset_for(request.user).get(pk=event.pk)
        return Response({'removed': removed, **event_payload(fresh, request)})
