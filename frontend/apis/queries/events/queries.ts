"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/apis/QUERY_KEYS";
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  rsvpEvent,
  unrsvpEvent,
  updateEvent,
} from "@/apis/queries/events/functions";
import type { Event, EventListParams, EventPayload } from "@/apis/types/event";

export function useEventsQuery(params?: EventListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.events.list(params),
    queryFn: () => listEvents(params),
  });
}

export function useEventQuery(eventId?: string | number) {
  return useQuery({
    queryKey: QUERY_KEYS.events.detail(eventId ?? ""),
    queryFn: () => getEvent(eventId as string | number),
    enabled: Boolean(eventId),
  });
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: QUERY_KEYS.events.create,
    mutationFn: createEvent,
    onSuccess: (event) => {
      queryClient.setQueryData<Event>(QUERY_KEYS.events.detail(event.id), event);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.all });
    },
  });
}

export function useUpdateEventMutation(eventId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...QUERY_KEYS.events.update, String(eventId)],
    mutationFn: (payload: EventPayload) => updateEvent(eventId, payload),
    onSuccess: (event) => {
      queryClient.setQueryData<Event>(QUERY_KEYS.events.detail(event.id), event);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.all });
    },
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: QUERY_KEYS.events.delete,
    mutationFn: deleteEvent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.all });
    },
  });
}

export function useRsvpEventMutation(eventId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...QUERY_KEYS.events.rsvp, String(eventId)],
    mutationFn: () => rsvpEvent(eventId),
    onSuccess: (result) => {
      queryClient.setQueryData<Event>(QUERY_KEYS.events.detail(result.event.id), result.event);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.all });
    },
  });
}

export function useUnrsvpEventMutation(eventId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [...QUERY_KEYS.events.unrsvp, String(eventId)],
    mutationFn: () => unrsvpEvent(eventId),
    onSuccess: (result) => {
      queryClient.setQueryData<Event>(QUERY_KEYS.events.detail(result.event.id), result.event);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.all });
    },
  });
}
