import type { NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { proxyToBackend } from "@/lib/api/upstream";

export const POST = (request: NextRequest) =>
  proxyToBackend(request, { method: "POST", upstreamPath: API_ROUTES.wallet.upstream.debit, forwardBody: true });
