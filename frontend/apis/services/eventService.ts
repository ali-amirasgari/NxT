import { API_ROUTES } from "@/apis/API_ROUTES";
import { BaseService } from "@/apis/services/baseService";
import type {
  Event,
  EventEnvelope,
  EventListEnvelope,
  EventListParams,
  EventPayload,
  EventRsvpResult,
} from "@/apis/types/event";

function compactParams(params?: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ""),
  );
}

class EventService extends BaseService {
  async listEvents(params?: EventListParams): Promise<Event[]> {
    const response = await this.getClient().get<EventListEnvelope>(
      API_ROUTES.events.list,
      { params: compactParams(params) },
    );
    return response.data.events;
  }

  async getEvent(eventId: string | number): Promise<Event> {
    const response = await this.getClient().get<EventEnvelope>(
      API_ROUTES.events.detail(eventId),
    );
    return response.data.event;
  }

  async createEvent(payload: EventPayload): Promise<Event> {
    const response = await this.getClient().post<EventEnvelope>(
      API_ROUTES.events.list,
      payload,
    );
    return response.data.event;
  }

  async updateEvent(eventId: string | number, payload: EventPayload): Promise<Event> {
    const response = await this.getClient().patch<EventEnvelope>(
      API_ROUTES.events.detail(eventId),
      payload,
    );
    return response.data.event;
  }

  async deleteEvent(eventId: string | number): Promise<void> {
    await this.getClient().delete(API_ROUTES.events.detail(eventId));
  }

  async rsvpEvent(eventId: string | number): Promise<EventRsvpResult> {
    const response = await this.getClient().post<EventRsvpResult>(
      API_ROUTES.events.rsvp(eventId),
    );
    return response.data;
  }

  async unrsvpEvent(eventId: string | number): Promise<EventRsvpResult> {
    const response = await this.getClient().delete<EventRsvpResult>(
      API_ROUTES.events.rsvp(eventId),
    );
    return response.data;
  }
}

const eventService = new EventService();

export default eventService;
