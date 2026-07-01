import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export const GET = (request: NextRequest) =>
  proxyToBackend(request, { method: "GET", upstreamPath: API_ROUTES.events.upstream.list });

export const POST = (request: NextRequest) =>
  proxyToBackend(request, {
    method: "POST",
    upstreamPath: API_ROUTES.events.upstream.list,
    forwardBody: true,
  });
