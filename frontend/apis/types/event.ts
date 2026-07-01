import type { User } from "@/apis/types/user";

export type EventTag = "workshop" | "challenge" | "meeting" | "other";
export type EventStatus = "scheduled" | "cancelled" | "completed";

export type Event = {
  id: number;
  host_id: number;
  host: User;
  title: string;
  description: string;
  tag: EventTag;
  tag_label: string;
  status: EventStatus;
  cover_color: string;
  cover_image: string;
  location: string;
  starts_at: string;
  ends_at?: string | null;
  attendee_count: number;
  is_attending: boolean;
  created_at: string;
  updated_at: string;
};

export type EventPayload = Partial<{
  title: string;
  description: string;
  tag: EventTag;
  status: EventStatus;
  cover_color: string;
  cover_image: string;
  location: string;
  starts_at: string;
  ends_at: string | null;
}>;

export type EventListParams = Partial<{
  status: EventStatus;
  search: string;
  upcoming: boolean;
}>;

export type EventEnvelope = { event: Event };
export type EventListEnvelope = { events: Event[] };
export type EventRsvpResult = { created?: boolean; removed?: boolean; event: Event };
