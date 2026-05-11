/**
 * DEPRECATED: useStatusPolling.js
 * 
 * This file is deprecated in favor of WebSockets (useSDNWebSocket.js) 
 * and the new /api/v1/metrics/dashboard endpoints.
 */
export function useStatusPolling() {
  return { status: 'SECURE', attackCount: 0 };
}
