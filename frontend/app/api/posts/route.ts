import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyMultipartToBackend, proxyToBackend } from "@/lib/api/upstream";

export const GET = (request: NextRequest) =>
  proxyToBackend(request, { method: "GET", upstreamPath: API_ROUTES.social.upstream.posts.list });

export function POST(request: NextRequest) {
  const upstreamPath = API_ROUTES.social.upstream.posts.list;
  if ((request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
    return proxyMultipartToBackend(request, { method: "POST", upstreamPath });
  }
  return proxyToBackend(request, { method: "POST", upstreamPath, forwardBody: true });
}
