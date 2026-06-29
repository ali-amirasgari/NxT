import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

// GET /api/users?search=&ids= — forwards the query string to the Django list endpoint.
export async function GET(request: NextRequest) {
  return proxyToBackend(request, {
    method: "GET",
    upstreamPath: API_ROUTES.users.upstream.list,
  });
}
