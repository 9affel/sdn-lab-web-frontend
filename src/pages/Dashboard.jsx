import React, { useEffect, useState, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  Zap,
  Network,
  TrendingUp,
  Cpu,
  HardDrive,
  Shield,
  Brain,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { getDashboardMetrics, getMetricsHistory, getAttackSummary } from "../api/services";
import { COLORS } from "../design-system/constants";
import { useSDNWebSocket } from '../hooks/useSDNWebSocket';

// ── Safe accessor helpers ────────────────────────────────────────────────────
const safe = (obj, path, fallback = 0) => {
  try {
    const value = path.split('.').reduce((o, k) => (o || {})[k], obj);
    return value ?? fallback;
  } catch { return fallback; }
};

// ── Default metrics shape (prevents "Failed to load" on cold start) ──────────
const DEFAULT_METRICS = {
  timestamp: new Date().toISOString(),
  network: { total_packets: 0, total_bytes: 0, packet_rate_pps: 0, byte_rate_mbps: 0, active_flows: 0, port_utilization: 0 },
  security: { attacks_detected_hour: 0, attacks_blocked_hour: 0, false_positives_hour: 0, defense_success_rate: 100, avg_response_time_ms: 0, blocked_traffic_pps: 0 },
  ai: { risk_model_accuracy: 0, rl_avg_reward: 0, predictions_per_second: 0, decision_latency_ms: 0 },
  system: { cpu_usage_percent: 0, memory_usage_mb: 0, uptime_hours: 0, services_healthy: 0, api_requests_per_min: 0 },
};

// ── Pure SVG Area Chart (replaces recharts) ──────────────────────────────────
function SvgAreaChart({ data, lines, width = "100%", height = 300 }) {
  if (!data || data.length < 2) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-slate-500 text-sm"
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

  // Y-axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    v: minV + t * (maxV - minV),
    y: yScale(minV + t * (maxV - minV)),
  }));

  // X-axis labels (show every ~6th)
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

      {/* Grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={t.y} x2={PAD.left + iW} y2={t.y}
            stroke="rgba(255,255,255,0.06)" strokeWidth={1}
          />
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fill="#64748b" fontSize={11}>
            {formatYValue(t.v)}
          </text>
        </g>
      ))}

      {/* Areas */}
      {lines.map((l) => (
        <path key={`area-${l.key}`} d={areaD(l.key)} fill={`url(#grad-${l.key})`} />
      ))}

      {/* Lines */}
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

      {/* X-axis labels */}
      {xLabels.map((x, i) => (
        <text 
          key={i} 
          x={x.x} 
          y={H - 12} 
          textAnchor="middle" 
          fill="#64748b" 
          fontSize={10}
        >
          {x.label}
        </text>
      ))}

      {/* Legend */}
      {lines.map((l, i) => (
        <g key={`leg-${i}`} transform={`translate(${W - PAD.right - lines.length * 100 + i * 100}, ${PAD.top - 10})`}>
          <rect x={0} y={-10} width={12} height={4} fill={l.color} rx={2} />
          <text x={16} y={-6} fill="#94a3b8" fontSize={11}>{l.name}</text>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [attackSummary, setAttackSummary] = useState(null);

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
    try {
      const [metricsRes, summaryRes] = await Promise.all([
        getDashboardMetrics(),
        getAttackSummary()
      ]);
      
      if (metricsRes.data) {
        setMetrics(metricsRes.data);
        setLastUpdated(new Date());
        setError(null);
      }
      
      if (summaryRes.data) {
        setAttackSummary(summaryRes.data);
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
      // Don't overwrite existing metrics on transient failures
      if (!metrics) {
        setError("Backend not reachable. Retrying...");
      }
    }
  }, [metrics]);

  // Initial load
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchHistory(), fetchMetrics()]);
      setLoading(false);
    };
    initData();
  }, []);

  // WebSocket updates — merge into metrics
  useEffect(() => {
    if (wsMetrics && wsMetrics.type === 'metrics_update') {
      // WS payload may be partial (just network block from ingest), or full dashboard shape.
      // Merge it into existing metrics to avoid losing sections.
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

  // Fallback polling (5s) when WebSocket is not connected
  useEffect(() => {
    const pollInterval = import.meta.env.VITE_STATUS_POLL_INTERVAL || 5000;
    const interval = setInterval(() => {
      if (wsStatus !== 'OPEN') {
        fetchMetrics();
      }
      // Refresh history every 30s
    }, pollInterval);
    
    const historyInterval = setInterval(fetchHistory, 30000);
    
    return () => {
      clearInterval(interval);
      clearInterval(historyInterval);
    };
  }, [wsStatus, fetchMetrics, fetchHistory]);

  // Use real metrics or defaults
  const m = metrics || DEFAULT_METRICS;

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Connecting to backend...</p>
          {error && <p className="text-amber-400 text-sm mt-2">{error}</p>}
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
      textColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Security",
      value: `${attackSummary?.blocked || safe(m, 'security.attacks_blocked_hour')}/${attackSummary?.total_attacks || safe(m, 'security.attacks_detected_hour')}`,
      subtitle: `${safe(m, 'security.defense_success_rate', 100).toFixed(0)}% Success Rate`,
      icon: Shield,
      textColor: "text-green-400",
      borderColor: "border-green-500/30",
      bgColor: "bg-green-500/10",
    },
    {
      title: "AI Engine",
      value: `${safe(m, 'ai.predictions_per_second').toLocaleString()} pred/s`,
      subtitle: `${(safe(m, 'ai.decision_latency_ms')).toFixed(3)}ms latency`,
      icon: Brain,
      textColor: "text-purple-400",
      borderColor: "border-purple-500/30",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "System Health",
      value: `${safe(m, 'system.services_healthy', 0)}/3 Active`,
      subtitle: `${safe(m, 'system.cpu_usage_percent').toFixed(1)}% CPU • ${Math.round(safe(m, 'system.memory_usage_mb'))} MB RAM`,
      icon: Cpu,
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Real-time SDN-EDR metrics and threat monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${wsStatus === 'OPEN' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${wsStatus === 'OPEN' ? 'bg-green-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${wsStatus === 'OPEN' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            </span>
            {wsStatus === 'OPEN' ? 'Live' : 'Polling'}
          </div>
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`border ${card.borderColor} hover:border-opacity-100 transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/40 border border-slate-700/50">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Now</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm font-medium">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                  <p className="text-slate-500 text-xs">{card.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SVG Area Chart */}
      <Card className="border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Network Performance (24h)
            </CardTitle>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              Real-time
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SvgAreaChart
            data={history}
            height={300}
            lines={[
              { key: "pps", color: "#3b82f6", name: "Packets/sec" },
              { key: "bytes_per_sec", color: "#10b981", name: "MB/s" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Attacks Blocked</p>
                <p className="text-2xl font-bold text-green-400">
                  {attackSummary?.blocked || safe(m, 'security.attacks_blocked_hour')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Model Accuracy</p>
                <p className="text-2xl font-bold text-purple-400">
                  {(safe(m, 'ai.risk_model_accuracy') * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-cyan-500/10">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Response Time</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {safe(m, 'security.avg_response_time_ms').toFixed(2)}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}