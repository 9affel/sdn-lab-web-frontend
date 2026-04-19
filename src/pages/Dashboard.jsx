import React from "react";
import {
  Activity,
  AlertTriangle,
  Eye,
  Radio,
  Network,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useStatusPolling } from "../hooks/useStatusPolling";

// Chart data
const weeklyActivityData = [
  { day: "Mon", value: 12 },
  { day: "Tue", value: 18 },
  { day: "Wed", value: 8 },
  { day: "Thu", value: 16 },
  { day: "Fri", value: 22 },
  { day: "Sat", value: 10 },
  { day: "Sun", value: 6 },
];

const threatDistributionData = [
  { name: "Phishing", value: 45 },
  { name: "Malware", value: 25 },
  { name: "Trackers", value: 20 },
  { name: "Other", value: 10 },
];

// Colors for pie chart
const PIE_COLORS = {
  Phishing: "#E74C3C",
  Malware: "#F5A623",
  Trackers: "#00D9C0",
  Other: "#6B7280",
};

export default function Dashboard() {
  const { status, attackCount, totalLogs, recentLogs, loading } =
    useStatusPolling();

  const statCards = [
    {
      title: "Threats Blocked",
      value: "1,247",
      subtitle: "+12% from last week",
      icon: AlertTriangle,
      cardClass: "card-red",
      textColor: "text-red",
      bgColor: "bg-red-dark/20",
      borderColor: "border-red/30",
    },
    {
      title: "Privacy Score",
      value: "98%",
      subtitle: "Excellent protection",
      icon: Eye,
      cardClass: "card-green",
      textColor: "text-green",
      bgColor: "bg-green/20",
      borderColor: "border-green/30",
    },
    {
      title: "Sites Scanned",
      value: "3,451",
      subtitle: "This month",
      icon: Network,
      cardClass: "card-cyan",
      textColor: "text-cyan",
      bgColor: "bg-cyan/20",
      borderColor: "border-cyan/30",
    },
    {
      title: "Active Protection",
      value: "24/7",
      subtitle: "All services running",
      icon: Zap,
      cardClass: "card-amber",
      textColor: "text-amber",
      bgColor: "bg-amber/20",
      borderColor: "border-amber/30",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-heading-lg text-text-primary mb-1">Dashboard</h1>
        <p className="text-text-secondary">Real-time protection and monitoring</p>
      </div>

      {/* KPI Cards Grid - 1x4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`${card.cardClass} p-6 rounded-2xl hover-lift group cursor-pointer border-l-4 transition-all duration-300`}
              style={{
                borderLeftColor:
                  card.cardClass === "card-red"
                    ? "#E74C3C"
                    : card.cardClass === "card-green"
                      ? "#0A4A3F"
                      : card.cardClass === "card-cyan"
                        ? "#00D9C0"
                        : "#F5A623",
                animationDelay: `${idx * 50}ms`,
              }}
            >
              {/* Card Content */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-label text-text-secondary mb-2 uppercase">
                      {card.title}
                    </p>
                    <p className={`text-5xl font-bold ${card.textColor}`}>
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg ${card.bgColor} border ${card.borderColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
                <p className="text-text-secondary text-sm">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section - 2 cols */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card variant="cyan" className="hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan" />
                Weekly Activity
              </CardTitle>
              <Badge variant="cyan">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 20, 32, 0.95)",
                      border: "1px solid rgba(0, 217, 192, 0.3)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#00D9C0" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00D9C0"
                    strokeWidth={3}
                    dot={{ fill: "#00D9C0", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Threat Distribution */}
        <Card variant="amber" className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber" />
              Threat Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div style={{ width: "100%", height: 260, display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={threatDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {threatDistributionData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 20, 32, 0.95)",
                        border: "1px solid rgba(245, 166, 35, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="w-full mt-6 space-y-2">
                {threatDistributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[item.name] }}
                      ></div>
                      <span className="text-text-primary text-sm">{item.name}</span>
                    </div>
                    <span className="text-text-secondary text-sm font-semibold">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Full Width */}
      <Card variant="cyan" className="hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan" />
              Recent Activity
            </CardTitle>
            <Badge variant="cyan">{recentLogs?.length || 0} Events</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.slice(0, 5).map((log, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-border-light hover:border-cyan/50 hover:bg-cyan/5 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-2 h-2 rounded-full bg-cyan mt-1.5 flex-shrink-0 animate-glow-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary group-hover:text-cyan transition-colors">
                          {log.threat_level?.toUpperCase() || "INFO"}
                        </p>
                        <p className="text-xs text-text-muted font-mono truncate mt-0.5">
                          {log.source_ip} → {log.dest_ip}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        log.threat_level === "critical"
                          ? "red"
                          : log.threat_level === "warning"
                            ? "amber"
                            : "green"
                      }
                    >
                      {log.threat_level || "low"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Activity className="w-8 h-8 text-text-muted/30 mx-auto mb-3" />
                <p className="text-text-muted">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}