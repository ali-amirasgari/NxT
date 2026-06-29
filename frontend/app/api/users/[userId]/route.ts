import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { userId } = await params;

  return proxyToBackend(request, {
    method: "GET",
    upstreamPath: API_ROUTES.users.upstream.detail(userId),
  });
}
