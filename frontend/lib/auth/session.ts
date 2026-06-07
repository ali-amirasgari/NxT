import { cookies } from "next/headers";

import { hasAuthCookies } from "@/lib/auth/cookies";

export async function hasServerSession() {
  const cookieStore = await cookies();
  return hasAuthCookies(cookieStore);
}
