import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const NotificationContext = createContext(null);

/**
 * Global notification store — listens to WS /attacks endpoint
 * and accumulates in-app alerts. Wrap your app root with this provider.
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const wsRef                             = useRef(null);
  const reconnectRef                      = useRef(null);
  const attemptsRef                       = useRef(0);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [notif, ...prev].slice(0, 50)); // keep last 50
    setUnreadCount(c => c + 1);
  }, []);

  const markAllRead = useCallback(() => setUnreadCount(0), []);

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Connect to WS /attacks to catch live attack events
  const connect = useCallback(() => {
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/^http/, 'ws');
    const url  = `${base}/ws/attacks`;
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => { attemptsRef.current = 0; };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);

          // attack_detected event from WS
          if (msg.type === 'attack_detected' && msg.attack) {
            const a = msg.attack;
            const sev = a.severity?.toLowerCase() || 'low';
            if (['critical', 'high'].includes(sev)) {
              addNotification({
                id: a.id || Date.now().toString(),
                severity: sev,
                title: `${sev.toUpperCase()} — ${a.type || 'Attack'}`,
                body: `${a.source_ip || '?'} → ${a.destination_ip || '?'} | Action: ${a.action_taken?.action_name?.toUpperCase() || 'UNKNOWN'}`,
                ts: new Date(),
              });
            }
          }

          // generic alert event
          if (msg.type === 'alert') {
            const sev = msg.severity?.toLowerCase() || 'high';
            addNotification({
              id: `alert-${Date.now()}`,
              severity: sev,
              title: `${sev.toUpperCase()} ALERT`,
              body: msg.message || 'Security alert triggered',
              ts: new Date(),
            });
          }
        } catch { /* ignore parse errors */ }
      };

      ws.onclose = () => {
        const delay = Math.min(1000 * Math.pow(2, attemptsRef.current), 30000);
        attemptsRef.current += 1;
        reconnectRef.current = setTimeout(connect, delay);
      };
    } catch { /* silently retry */ }
  }, [addNotification]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, dismiss, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}
