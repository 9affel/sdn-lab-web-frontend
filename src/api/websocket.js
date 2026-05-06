/**
 * WebSocket URL helpers for the Live Pulse pipeline.
 *
 * The FastAPI backend exposes /ws/{attacks,flows,metrics,alerts} which the
 * ingestion handlers broadcast on. We derive the ws:// URL from the same
 * VITE_API_BASE_URL the axios client uses so a single env var configures
 * both REST and WebSocket transports.
 */

const HTTP_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://172.20.20.8:8000";

/**
 * Convert an http(s):// URL into the matching ws(s):// URL.
 */
export function toWebSocketBase(httpUrl = HTTP_BASE) {
  try {
    const url = new URL(httpUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    // Drop any path/query so callers can append /ws/<channel>.
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    // Fallback for non-URL strings (e.g. in tests).
    return httpUrl
      .replace(/^http(s?):\/\//, (_, s) => `ws${s}://`)
      .replace(/\/$/, "");
  }
}

/**
 * Build the WebSocket URL for a named channel.
 *
 * @param {('attacks'|'flows'|'metrics'|'alerts')} channel
 * @returns {string}
 */
export function wsUrl(channel) {
  return `${toWebSocketBase()}/ws/${channel}`;
}
