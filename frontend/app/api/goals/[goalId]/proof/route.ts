import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyMultipartToBackend, proxyToBackend } from "@/lib/api/upstream";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> },
) {
  const { goalId } = await params;
  return proxyToBackend(request, {
    method: "GET",
    upstreamPath: API_ROUTES.goals.upstream.proof(goalId),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> },
) {
  const { goalId } = await params;
  return proxyMultipartToBackend(request, {
    method: "POST",
    upstreamPath: API_ROUTES.goals.upstream.proof(goalId),
  });
}
