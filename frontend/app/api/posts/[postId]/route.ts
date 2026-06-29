import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return proxyToBackend(request, { method: "GET", upstreamPath: API_ROUTES.social.upstream.posts.detail(postId) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return proxyToBackend(request, {
    method: "PATCH",
    upstreamPath: API_ROUTES.social.upstream.posts.detail(postId),
    forwardBody: true,
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return proxyToBackend(request, { method: "DELETE", upstreamPath: API_ROUTES.social.upstream.posts.detail(postId) });
}
