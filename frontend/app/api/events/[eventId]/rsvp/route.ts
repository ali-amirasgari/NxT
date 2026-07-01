import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return proxyToBackend(request, { method: "POST", upstreamPath: API_ROUTES.events.upstream.rsvp(eventId) });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return proxyToBackend(request, { method: "DELETE", upstreamPath: API_ROUTES.events.upstream.rsvp(eventId) });
}
