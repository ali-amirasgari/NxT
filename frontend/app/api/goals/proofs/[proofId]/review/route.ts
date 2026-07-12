import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ proofId: string }> },
) {
  const { proofId } = await params;
  return proxyToBackend(request, {
    method: "POST",
    upstreamPath: API_ROUTES.goals.upstream.proofReview(proofId),
    forwardBody: true,
  });
}
