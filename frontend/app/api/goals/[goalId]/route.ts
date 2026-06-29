import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export async function GET(request: NextRequest, { params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  return proxyToBackend(request, { method: "GET", upstreamPath: API_ROUTES.goals.upstream.detail(goalId) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  return proxyToBackend(request, {
    method: "PATCH",
    upstreamPath: API_ROUTES.goals.upstream.detail(goalId),
    forwardBody: true,
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  return proxyToBackend(request, { method: "DELETE", upstreamPath: API_ROUTES.goals.upstream.detail(goalId) });
}
