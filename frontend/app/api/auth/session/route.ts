import type { NextRequest } from "next/server";

import { handleAuthRoute } from "@/lib/auth/upstream";

export async function GET(request: NextRequest) {
  return handleAuthRoute(request, "session");
}
