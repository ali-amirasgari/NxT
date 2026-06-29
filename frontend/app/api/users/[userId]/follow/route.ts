import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

type RouteContext = { params: Promise<{ userId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { userId } = await params;

  return proxyToBackend(request, {
    method: "POST",
    upstreamPath: API_ROUTES.users.upstream.follow(userId),
  });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { userId } = await params;

  return proxyToBackend(request, {
    method: "DELETE",
    upstreamPath: API_ROUTES.users.upstream.follow(userId),
  });
}
