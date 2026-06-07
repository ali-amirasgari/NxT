import { NextResponse, type NextRequest } from "next/server";

import { API_ROUTES } from "@/apis/API_ROUTES";
import { config } from "@/lib/config";
import { signinSchema, signupSchema } from "@/validations/auth-validation";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from "./cookies";

type AuthRouteKey = "login" | "register" | "refresh" | "logout" | "session";

type RouteConfig = {
  method: "GET" | "POST";
  upstreamPath: string;
  validate?: (value: unknown) => {
    success: boolean;
    error?: { flatten: () => unknown };
  };
};

const AUTH_ROUTE_CONFIG: Record<AuthRouteKey, RouteConfig> = {
  login: {
    method: "POST",
    upstreamPath: API_ROUTES.auth.upstream.login,
    validate: signinSchema.safeParse,
  },
  register: {
    method: "POST",
    upstreamPath: API_ROUTES.auth.upstream.register,
    validate: signupSchema.safeParse,
  },
  refresh: {
    method: "POST",
    upstreamPath: API_ROUTES.auth.upstream.refresh,
  },
  logout: {
    method: "POST",
    upstreamPath: API_ROUTES.auth.upstream.logout,
  },
  session: {
    method: "GET",
    upstreamPath: API_ROUTES.auth.upstream.session,
  },
};

export async function handleAuthRoute(request: NextRequest, route: AuthRouteKey) {
  const routeConfig = AUTH_ROUTE_CONFIG[route];
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const requestBody = routeConfig.method === "GET" ? undefined : await parseRequestJson(request);

  if (routeConfig.validate) {
    const validation = routeConfig.validate(requestBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validation.error?.flatten(),
        },
        { status: 400 }
      );
    }
  }

  if (route === "session" && !accessToken && !refreshToken) {
    const response = NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: "No active session",
      },
      { status: 401 }
    );
    clearAuthCookies(response);
    return response;
  }

  if (route === "refresh" && !refreshToken) {
    const response = NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: "Missing refresh token",
      },
      { status: 401 }
    );
    clearAuthCookies(response);
    return response;
  }

  if (route === "logout" && !accessToken && !refreshToken) {
    const response = NextResponse.json(
      {
        success: true,
        authenticated: false,
      },
      { status: 200 }
    );
    clearAuthCookies(response);
    return response;
  }

  const payload =
    route === "refresh"
      ? getRefreshPayload(requestBody, refreshToken)
      : route === "logout"
        ? getLogoutPayload(requestBody, {
            accessToken,
            refreshToken,
          })
        : route === "register"
          ? getRegisterPayload(requestBody)
        : requestBody;

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetchUpstream(routeConfig.upstreamPath, {
      method: routeConfig.method,
      accessToken,
      refreshToken,
      body: payload,
    });
  } catch {
    const failureResponse = NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: "Upstream auth service unavailable",
      },
      { status: 502 }
    );
    clearAuthCookies(failureResponse);
    return failureResponse;
  }

  const responseBody = await parseJsonSafely(upstreamResponse);
  const normalizedBody = normalizeAuthResponse(route, upstreamResponse.status, responseBody);
  const response = NextResponse.json(normalizedBody, { status: upstreamResponse.status });

  if (!upstreamResponse.ok || route === "logout") {
    clearAuthCookies(response);
    return response;
  }

  const tokens = extractTokens(responseBody);

  if (tokens.accessToken || tokens.refreshToken) {
    setAuthCookies(response, tokens);
  }

  if (route === "session") {
    response.headers.set("Cache-Control", "no-store");
  }

  return response;
}

async function fetchUpstream(
  path: string,
  options: {
    method: "GET" | "POST";
    accessToken?: string;
    refreshToken?: string;
    body?: unknown;
  }
) {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  } else if (options.refreshToken) {
    headers.set("Authorization", `Bearer ${options.refreshToken}`);
  }

  if (options.refreshToken) {
    headers.set("x-refresh-token", options.refreshToken);
  }

  return fetch(new URL(path, config.apiBaseUrl), {
    method: options.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });
}

async function parseRequestJson(request: NextRequest) {
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

function extractTokens(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const record = payload as Record<string, unknown>;
  const accessToken = getString(record.access_token) ?? getString(record.access);
  const refreshToken = getString(record.refresh_token) ?? getString(record.refresh);

  return {
    accessToken,
    refreshToken,
  };
}

function normalizeAuthResponse(route: AuthRouteKey, status: number, payload: unknown) {
  const tokens = extractTokens(payload);
  const publicPayload = getPublicPayload(payload);

  return {
    success: status >= 200 && status < 300,
    authenticated:
      route === "logout"
        ? false
        : route === "session"
          ? status >= 200 && status < 300
          : Boolean(tokens.accessToken || tokens.refreshToken || getAuthenticated(payload)),
    ...publicPayload,
  };
}

function getAuthenticated(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const value = (payload as Record<string, unknown>).authenticated;
  return typeof value === "boolean" ? value : false;
}

function getPublicPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const publicPayload = { ...(payload as Record<string, unknown>) };
  delete publicPayload.access_token;
  delete publicPayload.refresh_token;
  delete publicPayload.access;
  delete publicPayload.refresh;

  return publicPayload;
}

function getString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getRefreshPayload(body: unknown, refreshToken: string | undefined) {
  if (body && typeof body === "object") {
    return refreshToken ? { ...(body as Record<string, unknown>), refresh_token: refreshToken } : body;
  }

  return refreshToken ? { refresh_token: refreshToken } : undefined;
}

function getRegisterPayload(body: unknown) {
  if (!body || typeof body !== "object") {
    return body;
  }

  const payload = { ...(body as Record<string, unknown>) };
  delete payload.confirmPassword;
  return payload;
}

function getLogoutPayload(
  body: unknown,
  tokens: { accessToken?: string; refreshToken?: string }
) {
  const payload = body && typeof body === "object" ? { ...(body as Record<string, unknown>) } : {};

  if (tokens.accessToken && !("access_token" in payload)) {
    payload.access_token = tokens.accessToken;
  }

  if (tokens.refreshToken && !("refresh_token" in payload)) {
    payload.refresh_token = tokens.refreshToken;
  }

  return payload;
}
