import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, {
    method: "GET",
    upstreamPath: API_ROUTES.users.upstream.me,
  });
}

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request, {
    method: "PATCH",
    upstreamPath: API_ROUTES.users.upstream.me,
    forwardBody: true,
  });
}
