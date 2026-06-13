import type { NextRequest } from "next/server";

import { handleAuthRoute } from "@/lib/auth/upstream";

export async function POST(request: NextRequest) {
  return handleAuthRoute(request, "logout");
}
