import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { getDashboardMetrics, getMetricsHistory } from "../api/services";
import { COLORS } from "../design-system/constants";

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
  const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const allVals = lines.flatMap((l) => data.map((d) => d[l.key] ?? 0));
  const minV = 0;
  const maxV = Math.max(...allVals, 1);

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

  // X-axis labels (show every ~5th)
  const step = Math.ceil(data.length / 8);
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
            {Math.round(t.v)}
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
        <text key={i} x={x.x} y={H - 8} textAnchor="middle" fill="#64748b" fontSize={10}>
          {x.label}
        </text>
      ))}

      {/* Legend */}
      {lines.map((l, i) => (
        <g key={`leg-${i}`} transform={`translate(${PAD.left + i * 120}, ${H - 5})`}>
          <rect x={0} y={-10} width={12} height={4} fill={l.color} rx={2} />
          <text x={16} y={-6} fill="#94a3b8" fontSize={11}>{l.name}</text>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

import { useSDNWebSocket } from '../hooks/useSDNWebSocket';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: wsMetrics, status: wsStatus } = useSDNWebSocket('/metrics');

  const fetchHistory = async () => {
    try {
      const historyRes = await getMetricsHistory(24, 5);
      const chartData = (historyRes.data || []).map((item) => ({
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        pps: Math.round(item.pps),
        bytes_per_sec: Math.round((item.bytes_per_sec / 1024 / 1024) * 10) / 10,
        attacks_detected: item.attacks_detected,
        attacks_blocked: item.attacks_blocked,
      }));
      setHistory(chartData);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const fetchMetricsFallback = async () => {
    if (wsStatus === 'OPEN') return; // Don't poll if WS is connected
    try {
      const metricsRes = await getDashboardMetrics();
      setMetrics(metricsRes.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching fallback metrics:", err);
      // Optional: keep old metrics or set error state
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchHistory();
      if (wsStatus !== 'OPEN') {
        await fetchMetricsFallback();
      }
      setLoading(false);
    };
    initData();
  }, []);

  useEffect(() => {
    // Update metrics from WebSocket when data arrives
    if (wsMetrics && wsMetrics.type === 'metrics_update') {
      setMetrics(wsMetrics);
      setLoading(false);
    }
  }, [wsMetrics]);

  useEffect(() => {
    // 5-second fallback polling
    const pollInterval = import.meta.env.VITE_STATUS_POLL_INTERVAL || 5000;
    const interval = setInterval(fetchMetricsFallback, pollInterval);
    return () => clearInterval(interval);
  }, [wsStatus]);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load metrics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Network Throughput",
      value: `${metrics.network.packet_rate_pps.toLocaleString()} pps`,
      subtitle: `${metrics.network.byte_rate_mbps} MB/s`,
      icon: Network,
      textColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Security",
      value: `${metrics.security.attacks_blocked_hour}/${metrics.security.attacks_detected_hour}`,
      subtitle: `${metrics.security.defense_success_rate.toFixed(0)}% Success Rate`,
      icon: Shield,
      textColor: "text-green-400",
      borderColor: "border-green-500/30",
      bgColor: "bg-green-500/10",
    },
    {
      title: "AI Engine",
      value: `${metrics.ai.predictions_per_second.toLocaleString()} pred/s`,
      subtitle: `${(metrics.ai.decision_latency_ms * 1000).toFixed(1)}µs latency`,
      icon: Brain,
      textColor: "text-purple-400",
      borderColor: "border-purple-500/30",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "System Health",
      value: `${metrics.system.cpu_usage_percent.toFixed(1)}% CPU`,
      subtitle: `${Math.round(metrics.system.memory_usage_mb)}MB RAM`,
      icon: Cpu,
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Real-time SDN-EDR metrics and threat monitoring</p>
      </div>

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
                  <Badge className="bg-slate-700 text-slate-300">Now</Badge>
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
            <Badge className="bg-blue-500/20 text-blue-400">Real-time</Badge>
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
                  {metrics.security.attacks_blocked_hour}
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
                  {(metrics.ai.risk_model_accuracy * 100).toFixed(1)}%
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
                  {metrics.security.avg_response_time_ms.toFixed(2)}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}