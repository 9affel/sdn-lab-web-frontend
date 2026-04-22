/**
 * Mock Data Generators
 * Centralized mock data for development and fallback scenarios
 */

/**
 * Generate mock attack data for ThreatLogs
 * @returns {Array} Array of mock attack objects
 */
export const generateMockAttacks = () => [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    type: 'DDoS',
    source_ip: '192.168.1.100',
    destination_ip: '10.0.0.1',
    severity: 'critical',
    packets: 50000,
    bytes: 2500000,
    blocked: true,
    actions: 'Blocked',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    type: 'Port Scan',
    source_ip: '203.0.113.45',
    destination_ip: '10.0.0.0/24',
    severity: 'high',
    packets: 2500,
    bytes: 185000,
    blocked: true,
    actions: 'Rate Limited',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    type: 'Anomaly',
    source_ip: '198.51.100.89',
    destination_ip: '10.0.0.50',
    severity: 'medium',
    packets: 1200,
    bytes: 450000,
    blocked: false,
    actions: 'Monitored',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    type: 'Exploit',
    source_ip: '192.0.2.10',
    destination_ip: '10.0.0.25',
    severity: 'high',
    packets: 320,
    bytes: 95000,
    blocked: true,
    actions: 'Blocked',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    type: 'Scan',
    source_ip: '209.112.201.5',
    destination_ip: '10.0.0.0/16',
    severity: 'low',
    packets: 1800,
    bytes: 124000,
    blocked: false,
    actions: 'Logged',
  },
];

/**
 * Generate mock flow data for FlowInspector
 * @returns {Array} Array of mock flow objects
 */
export const generateMockFlows = () => [
  {
    id: '1',
    datapath_id: '00:00:00:00:00:00:00:01',
    flow_id: 1,
    match: {
      in_port: 1,
      ipv4_src: '192.168.1.10',
      ipv4_dst: '10.0.0.1',
      ip_proto: 6,
      tcp_dst: 443,
    },
    actions: ['output:2'],
    packets: 5000,
    bytes: 2500000,
    duration_sec: 3600,
  },
  {
    id: '2',
    datapath_id: '00:00:00:00:00:00:00:02',
    flow_id: 2,
    match: {
      in_port: 2,
      ipv4_src: '10.0.0.5',
      ipv4_dst: '172.16.0.0',
      ip_proto: 17,
      udp_dst: 53,
    },
    actions: ['output:1', 'set_queue:0'],
    packets: 3200,
    bytes: 1850000,
    duration_sec: 2400,
  },
  {
    id: '3',
    datapath_id: '00:00:00:00:00:00:00:01',
    flow_id: 3,
    match: {
      in_port: 3,
      ipv4_src: '192.168.1.20',
      ipv4_dst: '10.0.0.50',
      ip_proto: 6,
      tcp_dst: 22,
    },
    actions: ['drop'],
    packets: 150,
    bytes: 45000,
    duration_sec: 180,
  },
  {
    id: '4',
    datapath_id: '00:00:00:00:00:00:00:03',
    flow_id: 4,
    match: {
      in_port: 1,
      ipv4_src: '10.0.0.100',
      ipv4_dst: '192.168.1.0',
      ip_proto: 6,
    },
    actions: ['output:2', 'output:3'],
    packets: 8900,
    bytes: 4200000,
    duration_sec: 5400,
  },
];

/**
 * Generate mock decision latency history for AIModelLab
 * @param {Object} modelData - Model data object
 * @returns {Array} Array of latency history
 */
export const generateLatencyHistory = (modelData) => {
  const now = Date.now();
  return Array.from({ length: 12 }, (_, i) => ({
    time: new Date(now - (11 - i) * 5 * 60000).toLocaleTimeString(),
    latency: 0.3 + Math.random() * 0.15,
  }));
};

/**
 * Generate mock latency history (fallback version)
 * @returns {Array} Array of latency history
 */
export const generateLatencyHistoryMock = () => {
  const now = Date.now();
  return Array.from({ length: 12 }, (_, i) => ({
    time: new Date(now - (11 - i) * 5 * 60000).toLocaleTimeString(),
    latency: 0.3 + Math.random() * 0.15,
  }));
};

/**
 * Generate mock reward history for AIModelLab
 * @param {Object} modelData - Model data object
 * @returns {Array} Array of reward history
 */
export const generateRewardHistory = (modelData) => {
  const now = Date.now();
  return Array.from({ length: 20 }, (_, i) => ({
    episode: i + 1,
    reward: 450 + Math.random() * 150,
    avgReward: 480 + i * 2,
  }));
};

/**
 * Generate mock reward history (fallback version)
 * @returns {Array} Array of reward history
 */
export const generateRewardHistoryMock = () => {
  const now = Date.now();
  return Array.from({ length: 20 }, (_, i) => ({
    episode: i + 1,
    reward: 450 + Math.random() * 150,
    avgReward: 480 + i * 2,
  }));
};
