import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyMultipartToBackend } from "@/lib/api/upstream";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> },
) {
  const { goalId } = await params;
  return proxyMultipartToBackend(request, {
    method: "POST",
    upstreamPath: API_ROUTES.goals.upstream.cover(goalId),
  });
}
