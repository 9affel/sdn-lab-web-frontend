import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to manage WebSocket connections to the SDN-EDR backend.
 * Features automatic reconnection and exponential backoff.
 * 
 * @param {string} endpoint - The WebSocket endpoint (e.g., '/metrics', '/attacks')
 * @returns {Object} { data, status, error }
 */
export function useSDNWebSocket(endpoint) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('CONNECTING'); // CONNECTING, OPEN, CLOSED, ERROR
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Construct WebSocket URL from API base URL
    // Convert http(s) to ws(s)
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const wsBaseUrl = baseUrl.replace(/^http/, 'ws');
    const wsUrl = `${wsBaseUrl}/ws${endpoint}`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setStatus('OPEN');
        setError(null);
        reconnectAttemptsRef.current = 0; // Reset attempts on successful connection
      };

      wsRef.current.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      wsRef.current.onclose = () => {
        setStatus('CLOSED');
        attemptReconnect();
      };

      wsRef.current.onerror = (err) => {
        console.error(`WebSocket Error on ${endpoint}:`, err);
        setError('WebSocket Connection Error');
        setStatus('ERROR');
        // onclose will be called after onerror, triggering reconnect
      };
    } catch (e) {
      console.error(`Failed to create WebSocket to ${endpoint}:`, e);
      setError(e.message);
      setStatus('ERROR');
      attemptReconnect();
    }
  }, [endpoint]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      reconnectAttemptsRef.current += 1;
      
      console.log(`Attempting to reconnect WebSocket to ${endpoint} in ${delay}ms...`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        setStatus('CONNECTING');
        connect();
      }, delay);
    } else {
      console.error(`Max WebSocket reconnect attempts reached for ${endpoint}`);
      setStatus('ERROR');
      setError('Max reconnection attempts reached');
    }
  }, [connect, endpoint]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { data, status, error };
}
