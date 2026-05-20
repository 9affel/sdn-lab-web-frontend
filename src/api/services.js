import api from './axios';
import {
  generateMockAttacks,
  generateMockFlows,
  generateLatencyHistory,
  generateLatencyHistoryMock,
  generateRewardHistory,
  generateRewardHistoryMock,
} from './mockData';

/**
 * ========================
 * METRICS ENDPOINTS
 * ========================
 */

/**
 * Get complete dashboard metrics
 * GET /api/v1/metrics/dashboard
 */
export const getDashboardMetrics = () => api.get('/api/v1/metrics/dashboard');

/**
 * Get historical metrics for charting
 * GET /api/v1/metrics/history
 * @param {number} hours - Number of hours of history (1-720)
 * @param {number} resolution - Resolution in minutes (1-60)
 */
export const getMetricsHistory = (hours = 24, resolution = 5) =>
  api.get('/api/v1/metrics/history', { params: { hours, resolution } });

/**
 * ========================
 * ATTACKS ENDPOINTS
 * ========================
 */

/**
 * Get recent attacks with pagination
 * GET /api/v1/attacks
 */
export const getAttacks = (limit = 100, offset = 0, timerange = 3600) =>
  api.get('/api/v1/attacks', { params: { limit, offset, timerange } });

/**
 * Get specific attack by ID
 * GET /api/v1/attacks/{attack_id}
 */
export const getAttack = (attackId) => api.get(`/api/v1/attacks/${attackId}`);

/**
 * Get attack summary statistics
 * GET /api/v1/attacks/summary
 */
export const getAttackSummary = () => api.get('/api/v1/attacks/summary');

/**
 * ========================
 * TOPOLOGY ENDPOINTS
 * ========================
 */

/**
 * Get network topology (switches and links)
 * GET /api/v1/topology
 */
export const getTopology = () => api.get('/api/v1/topology');

/**
 * ========================
 * FLOWS ENDPOINTS
 * ========================
 */

/**
 * Get OpenFlow flows with optional filtering
 * GET /api/v1/flows
 * @param {string} dpid - Optional datapath ID filter
 * @param {number} limit - Result limit
 * @param {number} offset - Result offset
 */
export const getFlows = (dpid = null, limit = 100, offset = 0) => {
  const params = { limit, offset };
  if (dpid) params.dpid = dpid;
  return api.get('/api/v1/flows', { params });
};

/**
 * Get flow statistics
 * GET /api/v1/flows/statistics
 */
export const getFlowStatistics = () => api.get('/api/v1/flows/statistics');

/**
 * ========================
 * MODELS ENDPOINTS
 * ========================
 */

/**
 * Get available AI models information
 * GET /api/v1/models
 */
export const getModels = () => api.get('/api/v1/models');

/**
 * Get risk ML model predictions
 * POST /api/v1/models/predict
 * @param {Array<number>} features - 17-element network feature vector (XGBoost)
 * @param {string} flowKey - Flow identifier
 */
export const predictRisk = (features, flowKey) =>
  api.post('/api/v1/models/predict', { features, flow_key: flowKey });

/**
 * Get RL agent decision
 * POST /api/v1/models/decide
 * @param {Array<number>} networkFeatures - 17-element network feature vector
 * @param {Array<number>} riskProbs - 8-element risk probability vector
 * @param {string} flowKey - Flow identifier
 */
export const decideAction = (networkFeatures, riskProbs, flowKey) =>
  api.post('/api/v1/models/decide', {
    network_features: networkFeatures,
    risk_probs: riskProbs,
    flow_key: flowKey,
  });

/**
 * Get AI inference latency history for charting
 * GET /api/v1/models/latency-history
 */
export const getLatencyHistory = () => api.get('/api/v1/models/latency-history');

/**
 * Get RL agent reward history for charting
 * GET /api/v1/models/reward-history
 */
export const getRewardHistory = () => api.get('/api/v1/models/reward-history');

/**
 * Get RL action distribution counters
 * GET /api/v1/models/action-distribution
 */
export const getActionDistribution = () => api.get('/api/v1/models/action-distribution');

/**
 * ========================
 * HEALTH ENDPOINTS
 * ========================
 */

/**
 * Get system health check
 * GET /api/v1/health
 */
export const getHealth = () => api.get('/api/v1/health');

/**
 * ========================
 * SETTINGS ENDPOINTS
 * ========================
 */

/**
 * Get all platform settings (security policy + data retention + network)
 * GET /api/v1/settings
 */
export const getSettings = () => api.get('/api/v1/settings');

/**
 * Get only the active security policy
 * GET /api/v1/settings/security
 */
export const getSecurityPolicy = () => api.get('/api/v1/settings/security');

/**
 * Update the active security policy
 * PUT /api/v1/settings/security
 */
export const updateSecurityPolicy = (policy) => api.put('/api/v1/settings/security', policy);

/**
 * Update data retention settings
 * PUT /api/v1/settings/data-retention
 */
export const updateDataRetention = (policy) => api.put('/api/v1/settings/data-retention', policy);


/**
 * ========================
 * MOCK DATA EXPORTS
 * ========================
 * Re-export centralized mock data generators
 */
export {
  generateMockAttacks,
  generateMockFlows,
  generateLatencyHistory,
  generateLatencyHistoryMock,
  generateRewardHistory,
  generateRewardHistoryMock,
} from './mockData';

