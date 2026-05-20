import React, { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  Zap,
  Network,
  TrendingUp,
  Cpu,
  Shield,
  Brain,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { getDashboardMetrics, getMetricsHistory, getAttackSummary, getAttacks, getModels } from "../api/services";
import { COLORS, withAlpha } from "../design-system/constants";
import { useSDNWebSocket } from '../hooks/useSDNWebSocket';

// ── Safe accessor helpers ────────────────────────────────────────────────────
const safe = (obj, path, fallback = 0) => {
  try {
    const value = path.split('.').reduce((o, k) => (o || {})[k], obj);
    return value ?? fallback;
  } catch { return fallback; }
};

const metricAsRatio = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "string"
    ? Number(value.trim().replace("%", ""))
    : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(1, numeric > 1 ? numeric / 100 : numeric));
};

const formatPercentMetric = (value) => {
  const score = metricAsRatio(value);
  return score === null ? "N/A" : `${(score * 100).toFixed(1)}%`;
};


// ── Benign / normal-traffic labels that must NOT count as attacks ─────────────
const BENIGN_CLASSES = new Set([
  'benign', 'normal', 'no_attack', 'no attack', 'none',
  'allow', 'allowed', 'unknown', 'normal_traffic',
]);

const getAttackClass = (attack) =>
  `${attack?.type || attack?.attack_type || attack?.ai_analysis?.attack_class || ''}`
    .trim().toLowerCase().replace(/\s+/g, '_');

const isBenign = (attack) => {
  const cls = getAttackClass(attack);
  return !cls || BENIGN_CLASSES.has(cls);
};

// ── Default metrics shape (prevents "Failed to load" on cold start) ──────────
const DEFAULT_METRICS = {
  timestamp: new Date().toISOString(),
  network: { 
    total_packets: 0, 
    total_bytes: 0, 
    packet_rate_pps: 0, 
    byte_rate_mbps: 0, 
    active_flows: 0, 
    port_utilization: 0,
    devices: {
      plc: { pps: 0, history: [] },
      sensor: { pps: 0, history: [] },
      attacker: { pps: 0, history: [] },
      factory_switch: { pps: 0, history: [] }
    }
  },
  security: { attacks_detected_hour: 0, attacks_blocked_hour: 0, false_positives_hour: 0, defense_success_rate: 100, avg_response_time_ms: 0, blocked_traffic_pps: 0 },
  ai: { risk_model_accuracy: null, risk_model_f1_score: null, rl_avg_reward: 0, predictions_per_second: 0, decision_latency_ms: 0 },
  system: { cpu_usage_percent: 0, memory_usage_mb: 0, uptime_hours: 0, services_healthy: 0, api_requests_per_min: 0 },
};

// ── Pure SVG Area Chart (replaces recharts) ──────────────────────────────────
function SvgAreaChart({ data, lines, width = "100%", height = 300 }) {
  if (!data || data.length < 2) {
    return (
      <div
        style={{ height, color: COLORS.text.tertiary }}
        className="flex items-center justify-center text-sm"
      >
        No historical data yet — collecting…
      </div>
    );
  }

  const W = 800;
  const H = height;
  const PAD = { top: 20, right: 20, bottom: 40, left: 60 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const allVals = lines.flatMap((l) => data.map((d) => d[l.key] ?? 0));
  const minV = 0;
  const maxV = Math.max(...allVals, 1);

  const formatYValue = (v) => {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
    if (v >= 1000) return (v / 1000).toFixed(1) + "K";
    return Math.round(v);
  };

  const xScale = (i) => PAD.left + (i / (data.length - 1)) * iW;
  const yScale = (v) => PAD.top + iH - ((v - minV) / (maxV - minV)) * iH;

  const pathD = (key) =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d[key] ?? 0)}`)
      .join(" ");

  const areaD = (key) =>
    `${pathD(key)} L${xScale(data.length - 1)},${yScale(0)} L${xScale(0)},${yScale(0)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    v: minV + t * (maxV - minV),
    y: yScale(minV + t * (maxV - minV)),
  }));

  const step = Math.max(Math.ceil(data.length / 6), 1);
  const xLabels = data
    .map((d, i) => ({ label: d.timestamp, x: xScale(i), show: i % step === 0 }))
    .filter((x) => x.show);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        {lines.map((l) => (
          <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={l.color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={l.color} stopOpacity={0.03} />
          </linearGradient>
        ))}
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={t.y} x2={PAD.left + iW} y2={t.y}
            stroke={withAlpha(COLORS.text.primary, '10')} strokeWidth={1}
          />
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fill={COLORS.text.tertiary} fontSize={11}>
            {formatYValue(t.v)}
          </text>
        </g>
      ))}

      {lines.map((l) => (
        <path key={`area-${l.key}`} d={areaD(l.key)} fill={`url(#grad-${l.key})`} />
      ))}

      {lines.map((l) => (
        <path
          key={`line-${l.key}`}
          d={pathD(l.key)}
          stroke={l.color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {xLabels.map((x, i) => (
        <text 
          key={i} 
          x={x.x} 
          y={H - 12} 
          textAnchor="middle" 
          fill={COLORS.text.tertiary} 
          fontSize={10}
        >
          {x.label}
        </text>
      ))}

      {lines.map((l, i) => (
        <g key={`leg-${i}`} transform={`translate(${W - PAD.right - lines.length * 100 + i * 100}, ${PAD.top - 10})`}>
          <rect x={0} y={-10} width={12} height={4} fill={l.color} rx={2} />
          <text x={16} y={-6} fill={COLORS.text.secondary} fontSize={11}>{l.name}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [attackSummary, setAttackSummary] = useState(null);
  const [benignTraffic, setBenignTraffic] = useState([]);

  const { data: wsMetrics, status: wsStatus } = useSDNWebSocket('/metrics');

  const fetchHistory = useCallback(async () => {
    try {
      const historyRes = await getMetricsHistory(24, 5);
      const chartData = (historyRes.data || []).map((item) => ({
        timestamp: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pps: Math.round(item.pps || 0),
        bytes_per_sec: Math.round(((item.bytes_per_sec || 0) / 1024 / 1024) * 10) / 10,
        attacks_detected: item.attacks_detected || 0,
        attacks_blocked: item.attacks_blocked || 0,
      }));
      setHistory(chartData);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    const [metricsRes, summaryRes, attacksRes] = await Promise.allSettled([
      getDashboardMetrics(),
      getAttackSummary(),
      getAttacks(200, 0, 3600),
    ]);

    if (metricsRes.status === 'fulfilled' && metricsRes.value.data) {
      setMetrics(metricsRes.value.data);
      setLastUpdated(new Date());
      setError(null);
    } else if (!metrics) {
      setError("Backend not reachable. Retrying...");
    }

    // Build an attack summary that excludes benign / normal traffic
    const rawSummary = summaryRes.status === 'fulfilled' ? summaryRes.value.data : null;
    const recentAttacks = attacksRes.status === 'fulfilled'
      ? (attacksRes.value.data?.attacks || [])
      : [];

    const realThreats = recentAttacks.filter((a) => !isBenign(a));
    const benignEntries = recentAttacks.filter((a) => isBenign(a));
    const blockedThreats = realThreats.filter((a) => a.blocked || a.mitigated || a.resolved);

    setBenignTraffic(benignEntries);
    setAttackSummary({
      ...(rawSummary || {}),
      total_attacks: realThreats.length,
      blocked: blockedThreats.length,
    });
  }, [metrics]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchHistory(), fetchMetrics()]);
      setLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    if (wsMetrics && wsMetrics.type === 'metrics_update') {
      setMetrics(prev => {
        const base = prev || DEFAULT_METRICS;
        return {
          ...base,
          timestamp: wsMetrics.timestamp || base.timestamp,
          network: { ...base.network, ...(wsMetrics.network || {}) },
          security: { ...base.security, ...(wsMetrics.security || {}) },
          ai: { ...base.ai, ...(wsMetrics.ai || {}) },
          system: { ...base.system, ...(wsMetrics.system || {}) },
        };
      });
      setLastUpdated(new Date());
      setLoading(false);
      setError(null);
    }
  }, [wsMetrics]);

  useEffect(() => {
    const pollInterval = import.meta.env.VITE_STATUS_POLL_INTERVAL || 5000;
    const interval = setInterval(() => {
      if (wsStatus !== 'OPEN') fetchMetrics();
    }, pollInterval);
    
    const historyInterval = setInterval(fetchHistory, 30000);
    
    return () => {
      clearInterval(interval);
      clearInterval(historyInterval);
    };
  }, [wsStatus, fetchMetrics, fetchHistory]);

  const m = metrics || DEFAULT_METRICS;

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: withAlpha(COLORS.accent.cyan, '20'), borderTopColor: COLORS.accent.cyan }}
          ></div>
          <p style={{ color: COLORS.text.secondary }}>Connecting to Industrial Control Plane...</p>
          {error && <p style={{ color: COLORS.status.warning }} className="text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Network Throughput",
      value: `${safe(m, 'network.packet_rate_pps').toLocaleString()} pps`,
      subtitle: `${safe(m, 'network.byte_rate_mbps')} MB/s`,
      icon: Network,
      color: COLORS.accent.cyan,
    },
    {
      title: "Security Status",
      value: `${attackSummary?.blocked || safe(m, 'security.attacks_blocked_hour')}/${attackSummary?.total_attacks || safe(m, 'security.attacks_detected_hour')}`,
      subtitle: `${safe(m, 'security.defense_success_rate', 100).toFixed(0)}% Block Rate (excl. benign)`,
      icon: Shield,
      color: COLORS.status.success,
    },
    {
      title: "AI Inference",
      value: `${safe(m, 'ai.predictions_per_second').toLocaleString()} pred/s`,
      subtitle: `${(safe(m, 'ai.decision_latency_ms')).toFixed(3)}ms latency`,
      icon: Brain,
      color: COLORS.status.warning,
    },
    {
      title: "System Health",
      value: `${safe(m, 'system.services_healthy', 0)}/${safe(m, 'system.total_services', 3)} Up`,
      subtitle: `${safe(m, 'system.cpu_usage_percent').toFixed(1)}% CPU Load`,
      icon: Cpu,
      color: COLORS.status.online || COLORS.status.success,
    },
    {
      title: "Defence Latency",
      value: `${safe(m, 'security.avg_response_time_ms').toFixed(2)}ms`,
      subtitle: "Avg mitigation response time",
      icon: Zap,
      color: COLORS.status.danger,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">SOFTWARE DEFINED NETWORK DASHBOARD</h1>
          <p style={{ color: COLORS.text.secondary }}>Industrial SDN-EDR Real-time Telemetry</p>
        </div>
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border"
            style={{ 
              backgroundColor: withAlpha(wsStatus === 'OPEN' ? COLORS.status.success : COLORS.status.warning, '10'),
              color: wsStatus === 'OPEN' ? COLORS.status.success : COLORS.status.warning,
              borderColor: withAlpha(wsStatus === 'OPEN' ? COLORS.status.success : COLORS.status.warning, '20')
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${wsStatus === 'OPEN' ? 'bg-green-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${wsStatus === 'OPEN' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            </span>
            {wsStatus === 'OPEN' ? 'LIVE LINK' : 'POLLING MODE'}
          </div>
          {lastUpdated && (
            <span className="text-xs font-mono" style={{ color: COLORS.text.tertiary }}>
              T: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} style={{ borderColor: withAlpha(card.color, '30') }} className="hover:border-opacity-100 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: withAlpha(card.color, '10') }}>
                    <Icon className="w-6 h-6" style={{ color: card.color }} />
                  </div>
                  <Badge variant="outline" className="border-dashed opacity-50" style={{ color: COLORS.text.tertiary }}>LIVE</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>{card.title}</p>
                  <p className="text-2xl font-black" style={{ color: card.color }}>{card.value}</p>
                  <p className="text-xs font-medium" style={{ color: COLORS.text.tertiary }}>{card.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>


      {/* Main Performance Chart */}
      <Card style={{ borderColor: withAlpha(COLORS.accent.cyan, '20') }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>
              <TrendingUp className="w-4 h-4" style={{ color: COLORS.accent.cyan }} />
              Telemetry Throughput Analysis (24H)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SvgAreaChart
            data={history}
            height={300}
            lines={[
              { key: "pps", color: COLORS.accent.cyan, name: "PPS RATE" },
              { key: "bytes_per_sec", color: COLORS.status.success, name: "MB/S RATE" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Benign / Normal Traffic Table */}
      <Card style={{ borderColor: withAlpha(COLORS.status.success, '20') }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>
              <Activity className="w-4 h-4" style={{ color: COLORS.status.success }} />
              Benign Traffic Log ({benignTraffic.length})
            </CardTitle>
            <Badge variant="outline" className="border-dashed opacity-50" style={{ color: COLORS.text.tertiary }}>NORMAL</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {benignTraffic.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: COLORS.text.tertiary }}>No benign traffic entries recorded in the last hour.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: withAlpha(COLORS.border.light, 'FF') }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: withAlpha(COLORS.status.success, '08') }}>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.tertiary, borderBottom: `1px solid ${withAlpha(COLORS.border.light, 'FF')}` }}>Time</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.tertiary, borderBottom: `1px solid ${withAlpha(COLORS.border.light, 'FF')}` }}>Source IP</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.tertiary, borderBottom: `1px solid ${withAlpha(COLORS.border.light, 'FF')}` }}>Destination IP</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.tertiary, borderBottom: `1px solid ${withAlpha(COLORS.border.light, 'FF')}` }}>Classification</th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.tertiary, borderBottom: `1px solid ${withAlpha(COLORS.border.light, 'FF')}` }}>Protocol</th>
                  </tr>
                </thead>
                <tbody>
                  {benignTraffic.slice(0, 20).map((entry, idx) => (
                    <tr
                      key={entry._id || entry.id || idx}
                      className="transition-colors"
                      style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : withAlpha(COLORS.background.hover, '33') }}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: COLORS.text.secondary }}>
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: COLORS.text.primary }}>
                        {entry.source_ip || entry.src_ip || '—'}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: COLORS.text.primary }}>
                        {entry.destination_ip || entry.dst_ip || '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                          style={{
                            backgroundColor: withAlpha(COLORS.status.success, '10'),
                            borderColor: withAlpha(COLORS.status.success, '30'),
                            color: COLORS.status.success,
                          }}
                        >
                          {(entry.type || entry.attack_type || entry.ai_analysis?.attack_class || 'Benign').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.text.tertiary }}>
                        {entry.protocol || entry.ip_protocol || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {benignTraffic.length > 20 && (
                <div className="px-4 py-2 text-center text-xs" style={{ color: COLORS.text.tertiary, borderTop: `1px solid ${withAlpha(COLORS.border.light, 'FF')}` }}>
                  Showing 20 of {benignTraffic.length} benign entries
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}

