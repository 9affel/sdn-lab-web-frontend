import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getAttacks, getAttackSummary, generateMockAttacks } from '../api/services';
import { COLORS, STATUS_COLOR_MAP } from '../design-system/constants';
import { useStatusColor } from '../design-system/hooks';
import { useSDNWebSocket } from '../hooks/useSDNWebSocket';

export default function ThreatLogs() {
  const [attacks, setAttacks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

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
        // Use mock data
        setAttacks(generateMockAttacks());
        setSummary({
          total_attacks: 47,
          blocked: 47,
          success_rate: 100,
          response_time_avg_ms: 0.8,
          peak_pps: 1250000,
          attack_types: { DDoS: 18, Scan: 12, Exploit: 10, Anomaly: 7 },
          actions_taken: { block: 40, rate_limit: 5, reroute: 2 },
        });
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

  const getSeverityStyle = (severity) => {
    const status = severity?.toLowerCase() || 'cyan';
    const colorKey = STATUS_COLOR_MAP[status] || 'cyan';
    
    const colorMap = {
      red: {
        bg: 'rgba(231, 76, 60, 0.08)',
        border: 'rgba(231, 76, 60, 0.3)',
        text: '#E74C3C',
      },
      green: {
        bg: 'rgba(10, 74, 63, 0.15)',
        border: 'rgba(10, 74, 63, 0.4)',
        text: '#0A4A3F',
      },
      amber: {
        bg: 'rgba(245, 166, 35, 0.08)',
        border: 'rgba(245, 166, 35, 0.3)',
        text: '#F5A623',
      },
      cyan: {
        bg: 'rgba(0, 217, 192, 0.08)',
        border: 'rgba(0, 217, 192, 0.3)',
        text: '#00D9C0',
      },
    };
    return colorMap[colorKey] || colorMap.cyan;
  };

  if (loading && !attacks.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: COLORS.status.danger + '40', borderTopColor: COLORS.status.danger }}></div>
          <p className="text-secondary">Loading threat data...</p>
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
          <Card style={{ borderColor: COLORS.status.danger + '40' }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.status.danger + '15' }}>
                  <AlertCircle className="w-5 h-5" style={{ color: COLORS.status.danger }} />
                </div>
                <Badge variant="danger">24h</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-tertiary text-sm">Total Attacks</p>
                <p className="text-2xl font-bold text-white">
                  {summary.total_attacks}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderColor: COLORS.status.success + '40' }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.status.success + '25' }}>
                  <ShieldAlert className="w-5 h-5" style={{ color: COLORS.status.success }} />
                </div>
                <Badge variant="success">
                  {summary.success_rate.toFixed(0)}%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-tertiary text-sm">Attacks Blocked</p>
                <p className="text-2xl font-bold text-white">{summary.blocked}</p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderColor: COLORS.accent.cyan + '40' }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.accent.cyan + '15' }}>
                  <Zap className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
                </div>
                <Badge variant="cyan">avg</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-tertiary text-sm">Response Time</p>
                <p className="text-2xl font-bold text-white">
                  {summary.response_time_avg_ms.toFixed(2)}ms
                </p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderColor: COLORS.accent.cyan + '40' }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.accent.cyan + '15' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
                </div>
                <Badge variant="cyan">peak</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-tertiary text-sm">Peak PPS</p>
                <p className="text-2xl font-bold text-white">
                  {(summary.peak_pps / 1000000).toFixed(1)}M
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Bar */}
      <Card className="border-border">
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Filter by Source/Dest IP or Attack Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-input border border-border text-sm text-white placeholder:text-muted focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/30 transition-colors"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-10 px-4 rounded-lg bg-input border border-border text-sm text-white focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/30 transition-colors"
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
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan" />
            Attack Events ({filteredAttacks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Source → Dest
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Confidence
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-secondary">
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
                          className="border-b border-hover hover:bg-hover/50 transition-colors"
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === attack.id ? null : attack.id
                            )
                          }
                        >
                          <td className="px-4 py-3 text-sm text-tertiary whitespace-nowrap">
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
                          <td className="px-4 py-3 text-sm font-mono">
                            <div className="text-cyan truncate max-w-xs">
                              {attack.source_ip || attack.src_ip || '—'}
                            </div>
                            <div className="text-muted truncate max-w-xs">
                              → {attack.destination_ip || attack.dst_ip || '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-tertiary">
                            {attack.type}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              style={{
                                backgroundColor: color.bg,
                                color: color.text,
                                borderColor: color.border,
                              }}
                              className="border"
                            >
                              {attack.severity?.toUpperCase() || 'UNKNOWN'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className="bg-hover text-hint">
                              {attack.action_taken?.action_name || 'UNKNOWN'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan to-cyan"
                                  style={{
                                    width: `${
                                      (attack.action_taken?.confidence || 0) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted">
                                {(
                                  (attack.action_taken?.confidence || 0) * 100
                                ).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ChevronDown
                              className={`w-5 h-5 text-muted transition-transform ${
                                expandedRow === attack.id ? 'rotate-180' : ''
                              }`}
                            />
                          </td>
                        </tr>

                      {/* Expanded Row - Anomaly and Feature Data */}
                      {expandedRow === attack.id && (
                        <tr className="bg-primary border-b border-border">
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
                                      {attack.anomaly?.packets_per_second.toFixed(
                                        2
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      SYN/ACK Ratio:
                                    </span>
                                    <span className="text-cyan font-mono">
                                      {attack.anomaly?.syn_ack_ratio.toFixed(3)}
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
