import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export const GET = (request: NextRequest) =>
  proxyToBackend(request, { method: "GET", upstreamPath: API_ROUTES.social.upstream.feed });
