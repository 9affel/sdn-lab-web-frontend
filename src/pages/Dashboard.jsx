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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { getDashboardMetrics, getMetricsHistory } from "../api/services";
import { COLORS } from "../design-system/constants";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary border rounded-lg p-3 shadow-lg" style={{ borderColor: COLORS.accent.cyan + '40' }}>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toFixed(2)}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsRes, historyRes] = await Promise.all([
          getDashboardMetrics(),
          getMetricsHistory(24, 5),
        ]);

        setMetrics(metricsRes.data);

        // Format history for chart
        const chartData = (historyRes.data || []).map((item) => ({
          timestamp: new Date(item.timestamp).toLocaleTimeString(),
          pps: Math.round(item.pps),
          bytes_per_sec: Math.round((item.bytes_per_sec / 1024 / 1024) * 10) / 10,
          attacks_detected: item.attacks_detected,
          attacks_blocked: item.attacks_blocked,
        }));

        setHistory(chartData);
        setError(null);
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setError("Failed to load dashboard metrics");
        // Use mock data for development
        setMetrics({
          timestamp: new Date().toISOString(),
          network: {
            packet_rate_pps: 65536,
            byte_rate_mbps: 450,
            active_flows: 45,
            port_utilization: 0.65,
          },
          security: {
            attacks_detected_hour: 12,
            attacks_blocked_hour: 12,
            defense_success_rate: 100,
            avg_response_time_ms: 0.5,
          },
          ai: {
            predictions_per_second: 1000,
            decision_latency_ms: 0.3,
            risk_model_accuracy: 0.8607,
            rl_avg_reward: 19.9,
          },
          system: {
            cpu_usage_percent: 24.5,
            memory_usage_mb: 512,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

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
      color: "from-blue-600 to-blue-400",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Security",
      value: `${metrics.security.attacks_blocked_hour}/${metrics.security.attacks_detected_hour}`,
      subtitle: `${metrics.security.defense_success_rate.toFixed(0)}% Success Rate`,
      icon: Shield,
      color: "from-green-600 to-green-400",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
      borderColor: "border-green-500/30",
    },
    {
      title: "AI Engine",
      value: `${metrics.ai.predictions_per_second.toLocaleString()} pred/s`,
      subtitle: `${(metrics.ai.decision_latency_ms * 1000).toFixed(1)}µs latency`,
      icon: Brain,
      color: "from-purple-600 to-purple-400",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/30",
    },
    {
      title: "System Health",
      value: `${metrics.system.cpu_usage_percent.toFixed(1)}% CPU`,
      subtitle: `${Math.round(metrics.system.memory_usage_mb)}MB RAM`,
      icon: Cpu,
      color: "from-cyan-600 to-cyan-400",
      bgColor: "bg-cyan-500/10",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Real-time SDN-EDR metrics and threat monitoring
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`border ${card.borderColor} group hover:border-opacity-100 transition-all duration-300`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                  <Badge className="bg-slate-700 text-slate-300">Now</Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-400 text-sm font-medium">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                  <p className="text-slate-500 text-xs">{card.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Area Chart */}
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
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ppsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bytesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="pps"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#ppsGradient)"
                  name="Packets/sec"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="bytes_per_sec"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#bytesGradient)"
                  name="MB/s"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
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
                  {metrics.security.attacks_blocked_hour}%
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