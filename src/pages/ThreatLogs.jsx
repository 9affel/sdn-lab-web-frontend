import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getAttacks, getAttackSummary } from '../api/services';
import { COLORS, withAlpha } from '../design-system/constants';
import { useSDNWebSocket } from '../hooks/useSDNWebSocket';

const severityStyles = {
  critical: {
    text: COLORS.status.danger,
    bg: withAlpha(COLORS.status.danger, '14'),
    border: withAlpha(COLORS.status.danger, '47'),
    dot: COLORS.status.danger,
  },
  high: {
    text: COLORS.status.danger,
    bg: withAlpha(COLORS.status.danger, '0F'),
    border: withAlpha(COLORS.status.danger, '38'),
    dot: COLORS.status.danger,
  },
  medium: {
    text: COLORS.status.warning,
    bg: withAlpha(COLORS.status.warning, '12'),
    border: withAlpha(COLORS.status.warning, '3D'),
    dot: COLORS.status.warning,
  },
  low: {
    text: COLORS.accent.cyan,
    bg: withAlpha(COLORS.accent.cyan, '0F'),
    border: withAlpha(COLORS.accent.cyan, '38'),
    dot: COLORS.accent.cyan,
  },
};

const getSeverityStyle = (severity) => {
  const key = severity?.toLowerCase() || 'low';
  return severityStyles[key] || severityStyles.low;
};

export default function ThreatLogs() {
  const [attacks, setAttacks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [error, setError] = useState(null);

  const { data: wsAttackData, status: wsStatus } = useSDNWebSocket('/attacks');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [attacksRes, summaryRes] = await Promise.all([
          getAttacks(100, 0, 86400), // Last 24 hours
          getAttackSummary(),
        ]);

        setAttacks(attacksRes.data.attacks || []);
        setSummary(summaryRes.data || null);
      } catch (err) {
        console.error('Error fetching threat data:', err);
        setError('Failed to load threat data');
        setAttacks([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Revert to 5s polling only if WS is not open
    let interval;
    if (wsStatus !== 'OPEN') {
      const pollInterval = import.meta.env.VITE_LOGS_POLL_INTERVAL || 10000;
      interval = setInterval(fetchData, pollInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [wsStatus]);

  useEffect(() => {
    if (wsAttackData) {
      // Backend uses "attack_detected" or "attack_resolved" for type
      if (wsAttackData.type === 'attack_detected' && wsAttackData.attack) {
        // Append new attack to the top of the list
        setAttacks((prev) => [wsAttackData.attack, ...prev].slice(0, 100));
      } else if (wsAttackData.type === 'summary') {
        setSummary(wsAttackData.data);
      }
      setLoading(false);
    }
  }, [wsAttackData]);

  const filteredAttacks = attacks.filter((attack) => {
    const matchesSearch =
      attack.source_ip?.includes(searchTerm) ||
      attack.destination_ip?.includes(searchTerm) ||
      attack.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      severityFilter === 'all' || attack.severity?.toLowerCase() === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  if (loading && !attacks.length && !error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: withAlpha(COLORS.status.danger, '40'), borderTopColor: COLORS.status.danger }}></div>
          <p className="text-secondary">Loading threat data...</p>
        </div>
      </div>
    );
  }

  if (error && !attacks.length) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg inline-block">
          <p className="font-semibold">⚠️ {error}</p>
          <p className="text-sm mt-1 opacity-80">Check backend connectivity or Ryu controller status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Threat Intelligence</h1>
        <p className="text-secondary">
          Real-time attack detection, blocking actions, and security analytics
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-red-500/30 hover:border-red-500/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/40 border border-slate-700/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">24h</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Total Attacks</p>
                <p className="text-2xl font-bold text-red-400">
                  {summary.total_attacks}
                </p>
                <p className="text-slate-500 text-xs">Detected events</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-cyan-500/30 hover:border-cyan-500/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-cyan-500/10">
                  <ShieldAlert className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/40 border border-slate-700/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {(summary.success_rate ?? 0).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Attacks Blocked</p>
                <p className="text-2xl font-bold text-cyan-400">{summary.blocked}</p>
                <p className="text-slate-500 text-xs">Defense success rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-500/30 hover:border-blue-500/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/40 border border-slate-700/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">avg</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Response Time</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(summary.response_time_avg_ms ?? 0).toFixed(2)}ms
                </p>
                <p className="text-slate-500 text-xs">Average mitigation</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-500/30 hover:border-purple-500/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/40 border border-slate-700/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">peak</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-medium">Peak PPS</p>
                <p className="text-2xl font-bold text-purple-400">
                  {((summary.peak_pps || 0) / 1000000).toFixed(1)}M
                </p>
                <p className="text-slate-500 text-xs">Traffic pressure</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Bar */}
      <Card className="border border-cyan-500/20">
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Filter by Source/Dest IP or Attack Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-input border border-cyan-500/20 text-sm text-white placeholder:text-muted focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/30 transition-colors"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-10 px-4 rounded-lg bg-input border border-cyan-500/20 text-sm text-white focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/30 transition-colors"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Attacks Table */}
      <Card className="border border-cyan-500/20 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan" />
            Attack Events ({filteredAttacks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-input/70">
                <tr className="border-b border-cyan-500/20">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                    Source → Dest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                    Confidence
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttacks.length > 0 ? (
                  filteredAttacks.map((attack) => {
                    const color = getSeverityStyle(attack.severity);
                    return (
                      <React.Fragment key={attack.id}>
                        <tr
                          className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors cursor-pointer"
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === attack.id ? null : attack.id
                            )
                          }
                        >
                          <td className="px-4 py-4 text-sm text-slate-400 whitespace-nowrap">
                            {(() => {
                              const d = new Date(attack.timestamp);
                              const isValid = !isNaN(d.getTime());
                              if (!isValid) return attack.timestamp || '—';
                              return d.toLocaleString(undefined, {
                                month: 'short', day: '2-digit',
                                hour: '2-digit', minute: '2-digit', second: '2-digit',
                                hour12: false,
                              });
                            })()}
                          </td>
                          <td className="px-4 py-4 text-sm font-mono">
                            <div className="text-cyan truncate max-w-xs font-semibold">
                              {attack.source_ip || attack.src_ip || '—'}
                            </div>
                            <div className="text-muted truncate max-w-xs">
                              → {attack.destination_ip || attack.dst_ip || '—'}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <span className="font-medium text-slate-200">
                              {attack.type}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              style={{
                                backgroundColor: color.bg,
                                color: color.text,
                                borderColor: color.border,
                              }}
                              className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: color.dot }}
                              />
                              {attack.severity?.toUpperCase() || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <span className="inline-flex rounded-md border border-slate-700/50 bg-slate-800/40 px-2.5 py-1 text-xs font-medium text-slate-300">
                              {attack.action_taken?.action_name || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                                <div
                                  className="h-full bg-cyan"
                                  style={{
                                    width: `${
                                      (attack.action_taken?.confidence || 0) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="w-9 text-right text-xs font-semibold text-slate-300">
                                {(
                                  (attack.action_taken?.confidence || 0) * 100
                                ).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <ChevronDown
                              className={`mx-auto w-5 h-5 text-cyan transition-transform ${
                                expandedRow === attack.id ? 'rotate-180' : ''
                              }`}
                            />
                          </td>
                        </tr>

                      {/* Expanded Row - Anomaly and Feature Data */}
                      {expandedRow === attack.id && (
                        <tr className="bg-input/60 border-b border-cyan-500/10">
                          <td colSpan="7" className="px-4 py-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Anomaly Data */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-white text-sm mb-3">
                                  Anomaly Detection
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      Packets/sec:
                                    </span>
                                    <span className="text-cyan font-mono">
                                      {(attack.anomaly?.packets_per_second ?? 0).toFixed(
                                        2
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      SYN/ACK Ratio:
                                    </span>
                                    <span className="text-cyan font-mono">
                                      {(attack.anomaly?.syn_ack_ratio ?? 0).toFixed(3)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      URI Entropy:
                                    </span>
                                    <span className="text-cyan font-mono">
                                      {(
                                        attack.anomaly?.uri_entropy || 0
                                      ).toFixed(3)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* AI Analysis */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-white text-sm mb-3">
                                  AI ML Analysis
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      Risk Score:
                                    </span>
                                    <span className="text-red font-mono">
                                      {(
                                        (attack.ai_analysis?.risk_score || 0) *
                                        100
                                      ).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      Attack Class:
                                    </span>
                                    <span className="text-amber font-mono">
                                      {attack.ai_analysis?.attack_class}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      ML Confidence:
                                    </span>
                                    <span className="text-green font-mono">
                                      {(
                                        (attack.ai_analysis?.confidence || 0) *
                                        100
                                      ).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 17-Feature Summary */}
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-xs text-tertiary mb-2">
                                Note: Full 17-feature vector available in
                                backend. Summary shown above.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <p className="text-tertiary">
                        No attacks match your filters
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
