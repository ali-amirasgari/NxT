import type { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const THIRTY_DAYS_IN_SECONDS = ONE_DAY_IN_SECONDS * 30;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function hasAuthCookies(cookieStore: Pick<RequestCookiesLike, "get">) {
  return Boolean(
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  );
}

export function setAuthCookies(
  response: NextResponse,
  tokens: Partial<{ accessToken: string; refreshToken: string }>
) {
  if (tokens.accessToken) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction(),
      path: "/",
      maxAge: ONE_DAY_IN_SECONDS,
    });
  }

  if (tokens.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction(),
      path: "/",
      maxAge: THIRTY_DAYS_IN_SECONDS,
    });
  }
}

export function clearAuthCookies(response: NextResponse) {
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
    maxAge: 0,
  };

  response.cookies.set(ACCESS_TOKEN_COOKIE, "", options);
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", options);
}

type RequestCookiesLike = {
  get(name: string): { value: string } | undefined;
};
