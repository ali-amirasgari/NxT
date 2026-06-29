import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  const { commentId } = await params;
  return proxyToBackend(request, { method: "DELETE", upstreamPath: API_ROUTES.social.upstream.comments.detail(commentId) });
}
