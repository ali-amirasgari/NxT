import { NextResponse, type NextRequest } from "next/server";

import { config } from "@/lib/config";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";

type UpstreamMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type ProxyOptions = {
  method: UpstreamMethod;
  /** Django path, e.g. "/users/me". Query string is forwarded automatically. */
  upstreamPath: string;
  /** Forward the incoming JSON body to the upstream request. */
  forwardBody?: boolean;
};

const METHODS_WITHOUT_BODY = new Set<UpstreamMethod>(["GET", "DELETE"]);

/**
 * Authenticated reverse-proxy for the Django backend. The browser never holds
 * the access token (it lives in an HttpOnly cookie), so every authenticated
 * read/write goes through a same-origin route handler that injects the Bearer
 * token here. On a 401 the upstream status is passed straight back so the
 * browser Axios interceptor can refresh + retry against `/api/auth/refresh`.
 */
export async function proxyToBackend(request: NextRequest, options: ProxyOptions) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return unauthorized();
  }

  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let body: string | undefined;
  if (options.forwardBody && !METHODS_WITHOUT_BODY.has(options.method)) {
    const json = await readJsonSafely(request);
    if (json !== undefined) {
      body = JSON.stringify(json);
      headers.set("Content-Type", "application/json");
    }
  }

  const url = new URL(options.upstreamPath, config.apiBaseUrl);
  url.search = request.nextUrl.search;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: options.method,
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Upstream service unavailable" },
      { status: 502 },
    );
  }

  const data = await parseJsonSafely(upstream);
  const response = NextResponse.json(data ?? {}, { status: upstream.status });
  response.headers.set("Cache-Control", "no-store");

  return response;
}

/**
 * Same as {@link proxyToBackend} but forwards a multipart/form-data body
 * (file uploads). The browser sets the multipart boundary; we only inject the
 * Bearer token and let fetch re-serialize the reconstructed FormData.
 */
export async function proxyMultipartToBackend(
  request: NextRequest,
  options: { method: "POST" | "PATCH" | "PUT"; upstreamPath: string },
) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return unauthorized();
  }

  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const url = new URL(options.upstreamPath, config.apiBaseUrl);
  url.search = request.nextUrl.search;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: options.method,
      headers,
      body: form,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Upstream service unavailable" },
      { status: 502 },
    );
  }

  const data = await parseJsonSafely(upstream);
  const response = NextResponse.json(data ?? {}, { status: upstream.status });
  response.headers.set("Cache-Control", "no-store");

  return response;
}

function unauthorized() {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

async function readJsonSafely(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

async function parseJsonSafely(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}
