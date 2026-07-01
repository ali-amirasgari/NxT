const DEFAULT_CHAT_SERVICE_PORT = "8002";

/**
 * The chat-service is called directly from the browser (not proxied through
 * the Next.js BFF), so its origin must match whatever host the page was
 * loaded from — otherwise the `nxt_access` cookie (scoped to that host) never
 * gets attached and every request comes back 401. Deriving the host from
 * `window.location` keeps this correct on localhost, a LAN IP, or a real
 * domain without needing an env var kept in sync with how the app is accessed.
 */
export function getChatServiceBaseUrl(): string {
  const port = process.env.NEXT_PUBLIC_CHAT_SERVICE_PORT ?? DEFAULT_CHAT_SERVICE_PORT;

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }

  return (
    process.env.NEXT_PUBLIC_CHAT_SERVICE_URL ??
    process.env.NEXT_PUBLIC_CHAT_SOCKET_URL ??
    `http://localhost:${port}`
  );
}
