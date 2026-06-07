import { NextResponse, type NextRequest } from "next/server";

import { hasAuthCookies } from "@/lib/auth/cookies";
import appConfig from "@/lib/config";
import { defaultLocale, isLocale, locales } from "@/i18n/config";

function pickLocaleFromAcceptLanguage(headerValue: string | null) {
  if (!headerValue) return defaultLocale;

  const parts = headerValue
    .split(",")
    .map((part) => part.trim().split(";")[0])
    .filter(Boolean);

  for (const part of parts) {
    const normalized = part.toLowerCase();
    const exact = locales.find((l) => l === normalized);
    if (exact) return exact;

    const prefix = normalized.split("-")[0];
    const match = locales.find((l) => l === prefix);
    if (match) return match;
  }

  return defaultLocale;
}

function withLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : pickLocaleFromAcceptLanguage(request.headers.get("accept-language"));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!isLocale(cookieLocale)) {
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

function redirectWithLocale(request: NextRequest, pathname: string, localeResponse: NextResponse) {
  const response = NextResponse.redirect(new URL(pathname, request.url));
  const localeCookie = localeResponse.cookies.get("NEXT_LOCALE");

  if (localeCookie) {
    response.cookies.set(localeCookie);
  }

  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthenticated = hasAuthCookies(request.cookies);
  const localeResponse = withLocale(request);

  if (pathname.startsWith("/api/")) {
    return localeResponse;
  }

  if (!appConfig.authGuardsEnabled) {
    return localeResponse;
  }

  if (pathname === "/signin" || pathname === "/signup") {
    if (isAuthenticated) {
      return redirectWithLocale(request, "/app", localeResponse);
    }

    return localeResponse;
  }

  if (pathname === "/app" || pathname.startsWith("/app/")) {
    if (!isAuthenticated) {
      return redirectWithLocale(request, "/signin", localeResponse);
    }
  }

  return localeResponse;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
