import eventService from "@/apis/services/eventService";
import type { EventListParams, EventPayload } from "@/apis/types/event";

export function listEvents(params?: EventListParams) {
  return eventService.listEvents(params);
}

export function getEvent(eventId: string | number) {
  return eventService.getEvent(eventId);
}

export function createEvent(payload: EventPayload) {
  return eventService.createEvent(payload);
}

export function updateEvent(eventId: string | number, payload: EventPayload) {
  return eventService.updateEvent(eventId, payload);
}

export function deleteEvent(eventId: string | number) {
  return eventService.deleteEvent(eventId);
}

export function rsvpEvent(eventId: string | number) {
  return eventService.rsvpEvent(eventId);
}

export function unrsvpEvent(eventId: string | number) {
  return eventService.unrsvpEvent(eventId);
}
