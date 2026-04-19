import api from './axios';

/**
 * Fetch current security status and recent logs.
 * GET /api/status/
 * Returns: { status, most_recent_log, last_5_logs, attack_count, total_logs }
 */
export const getStatus = () => api.get('/api/status/');

/**
 * Fetch all security logs (paginated).
 * GET /api/logs/
 */
export const getLogs = (params = {}) => api.get('/api/logs/', { params });

/**
 * Submit a new security log entry.
 * POST /api/logs/
 */
export const postLog = (data) => api.post('/api/logs/', data);

/**
 * Fetch logs filtered by specific parameters.
 * Supports: source_ip, dest_ip, is_attack, threat_level, protocol
 */
export const getFilteredLogs = (filters) => {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });
  return api.get('/api/logs/', { params });
};
