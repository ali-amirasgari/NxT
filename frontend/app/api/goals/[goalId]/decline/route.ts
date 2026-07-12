import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> },
) {
  const { goalId } = await params;
  return proxyToBackend(request, {
    method: "POST",
    upstreamPath: API_ROUTES.goals.upstream.decline(goalId),
  });
}
