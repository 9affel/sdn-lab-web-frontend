import { useState, useEffect, useRef, useCallback } from 'react';
import { getStatus } from '../api/services';

/**
 * Polls GET /api/status/ at a configurable interval (default 5s).
 * Returns security status, recent logs, and loading/error state.
 */
export function useStatusPolling(intervalMs = 5000) {
  const [data, setData] = useState({
    status: 'SECURE',
    mostRecentLog: null,
    recentLogs: [],
    attackCount: 0,
    totalLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await getStatus();
      const result = response.data;

      setData({
        status: result.status || 'SECURE',
        mostRecentLog: result.most_recent_log || null,
        recentLogs: result.last_5_logs || [],
        attackCount: result.attack_count || 0,
        totalLogs: result.total_logs || 0,
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Set up polling interval
    intervalRef.current = setInterval(fetchStatus, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStatus, intervalMs]);

  return { ...data, loading, error, refetch: fetchStatus };
}
