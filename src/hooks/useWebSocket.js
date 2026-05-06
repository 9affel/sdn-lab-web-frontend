import { useEffect, useRef, useState } from "react";

/**
 * Minimal reconnecting WebSocket hook.
 *
 * @param {string|null} url
 *   The full ws://... URL to connect to. Pass `null` to disable the connection.
 * @param {object}      [options]
 * @param {(msg: any) => void} [options.onMessage]
 *   Callback invoked with parsed JSON for every incoming message. JSON parse
 *   failures fall through with the raw string.
 * @param {number} [options.reconnectDelayMs=2000]
 * @returns {{ status: 'connecting'|'open'|'closed'|'idle', lastMessage: any }}
 */
export default function useWebSocket(url, options = {}) {
  const { onMessage, reconnectDelayMs = 2000 } = options;
  const [status, setStatus] = useState(url ? "connecting" : "idle");
  const [lastMessage, setLastMessage] = useState(null);
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!url) {
      setStatus("idle");
      return undefined;
    }

    let ws = null;
    let cancelled = false;
    let reconnectTimer = null;

    const connect = () => {
      if (cancelled) return;
      setStatus("connecting");
      try {
        ws = new WebSocket(url);
      } catch (err) {
        console.warn("[useWebSocket] connect failed", err);
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        if (cancelled) return;
        setStatus("open");
      };
      ws.onmessage = (evt) => {
        let parsed = evt.data;
        try {
          parsed = JSON.parse(evt.data);
        } catch {
          /* keep raw string */
        }
        setLastMessage(parsed);
        if (handlerRef.current) {
          try {
            handlerRef.current(parsed);
          } catch (err) {
            console.warn("[useWebSocket] handler threw", err);
          }
        }
      };
      ws.onerror = () => {
        // The 'close' event fires next; nothing to do here.
      };
      ws.onclose = () => {
        if (cancelled) return;
        setStatus("closed");
        scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      if (cancelled) return;
      reconnectTimer = window.setTimeout(connect, reconnectDelayMs);
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      if (ws) {
        try {
          ws.close();
        } catch {
          /* ignore */
        }
      }
    };
  }, [url, reconnectDelayMs]);

  return { status, lastMessage };
}
