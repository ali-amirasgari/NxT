import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyMultipartToBackend, proxyToBackend } from "@/lib/api/upstream";

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return proxyToBackend(request, { method: "GET", upstreamPath: API_ROUTES.social.upstream.posts.detail(postId) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const upstreamPath = API_ROUTES.social.upstream.posts.detail(postId);
  if ((request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
    return proxyMultipartToBackend(request, { method: "PATCH", upstreamPath });
  }
  return proxyToBackend(request, { method: "PATCH", upstreamPath, forwardBody: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return proxyToBackend(request, { method: "DELETE", upstreamPath: API_ROUTES.social.upstream.posts.detail(postId) });
}
