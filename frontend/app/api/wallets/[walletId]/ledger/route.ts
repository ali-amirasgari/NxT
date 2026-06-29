import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export async function GET(request: NextRequest, { params }: { params: Promise<{ walletId: string }> }) {
  const { walletId } = await params;
  return proxyToBackend(request, {
    method: "GET",
    upstreamPath: API_ROUTES.wallet.upstream.ledger(walletId),
  });
}
