import React, { useEffect, useState } from 'react';
import { Activity, Filter, Search, Layers, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getFlows, getFlowStatistics } from '../api/services';
import { COLORS } from '../design-system/constants';

export default function FlowInspector() {
  const [flows, setFlows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDpid, setSelectedDpid] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [flowsRes, statsRes] = await Promise.all([
          getFlows(selectedDpid, 100, 0),
          getFlowStatistics(),
        ]);

        setFlows(flowsRes.data.flows || []);
        setStats(statsRes.data || null);
      } catch (err) {
        console.error('Error fetching flows:', err);
        // Use mock data
        setFlows(generateMockFlows());
        setStats({
          total_flows: 42,
          active_flows: 38,
          avg_packets_per_flow: 3450.5,
          total_bytes: 156789456,
          meters_active: 8,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [selectedDpid]);

  // Get unique DPIDs for filter
  const uniqueDpids = [...new Set(flows.map((f) => f.datapath_id))];

  // Filter flows
  const filteredFlows = flows.filter((flow) => {
    const matchesSearch =
      flow.datapath_id?.includes(searchTerm) ||
      flow.match?.ipv4_src?.includes(searchTerm) ||
      flow.match?.ipv4_dst?.includes(searchTerm);
    const matchesDpid = !selectedDpid || flow.datapath_id === selectedDpid;
    return matchesSearch && matchesDpid;
  });

  if (loading && !flows.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: COLORS.accent.cyan + '40', borderTopColor: COLORS.accent.cyan }}></div>
          <p className="text-secondary">Loading flows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Flow Inspector</h1>
        <p className="text-secondary">
          OpenFlow rules, statistics, and datapath management
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card style={{ borderColor: COLORS.accent.cyan + '40' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.accent.cyan + '15' }}>
                  <Layers className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
                </div>
                <Badge className="text-xs" style={{ backgroundColor: COLORS.accent.cyan + '30', color: COLORS.accent.cyan }}>Active</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-secondary text-sm">Active Flows</p>
                <p className="text-2xl font-bold text-white">
                  {stats.active_flows}
                </p>
                <p className="text-xs text-tertiary mt-2">
                  of {stats.total_flows} total
                </p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderColor: COLORS.accent.cyan + '40' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.accent.cyan + '15' }}>
                  <Activity className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-secondary text-sm">Avg Packets/Flow</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(stats.avg_packets_per_flow)}
                </p>
                <p className="text-xs text-tertiary mt-2">
                  {(stats.total_bytes / 1024 / 1024).toFixed(2)} MB total
                </p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderColor: COLORS.accent.cyan + '40' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.accent.cyan + '15' }}>
                  <Filter className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-secondary text-sm">Active Meters</p>
                <p className="text-2xl font-bold text-white">
                  {stats.meters_active}
                </p>
                <p className="text-xs text-tertiary mt-2">Rate limiters</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search by IP, DPID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-input border border-border text-sm text-white placeholder:text-muted focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/30 transition-colors"
              />
            </div>
            <select
              value={selectedDpid || ''}
              onChange={(e) =>
                setSelectedDpid(e.target.value === '' ? null : e.target.value)
              }
              className="h-10 px-4 rounded-lg bg-input border border-border text-sm text-white focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/30 transition-colors"
            >
              <option value="">Filter by DPID: All</option>
              {uniqueDpids.map((dpid) => (
                <option key={dpid} value={dpid}>
                  {dpid}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Flows Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
            OpenFlow Rules ({filteredFlows.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    DPID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Match (IPv4 Src/Dst)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    TCP Port
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Packets
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Bytes
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-secondary">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFlows.length > 0 ? (
                  filteredFlows.map((flow) => (
                    <React.Fragment key={flow.id}>
                      <tr
                        className="border-b border-hover hover:bg-hover/50 transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedRow(expandedRow === flow.id ? null : flow.id)
                        }
                      >
                        <td className="px-4 py-3 text-sm font-mono text-cyan">
                          {flow.datapath_id}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="text-xs bg-hover text-hint">
                            {flow.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-mono text-secondary">
                            {flow.match?.ipv4_src || '—'}
                          </div>
                          <div className="text-muted text-xs">
                            → {flow.match?.ipv4_dst || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-secondary">
                          {flow.match?.tcp_dst || flow.match?.udp_dst || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          {flow.packets.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          {(flow.bytes / 1024).toFixed(2)} KB
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          {flow.duration_seconds}s
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ChevronDown
                            className={`w-5 h-5 text-muted inline transition-transform ${
                              expandedRow === flow.id ? 'rotate-180' : ''
                            }`}
                          />
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRow === flow.id && (
                        <tr className="border-b border-border" style={{ backgroundColor: COLORS.primary }}>
                          <td colSpan="8" className="px-4 py-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-white text-sm mb-3">
                                  Match Criteria
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      ETH Type:
                                    </span>
                                    <span className="text-cyan font-mono">
                                      {flow.match?.eth_type || '—'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      IPv4 Src:
                                    </span>
                                    <span className="text-cyan font-mono">
                                      {flow.match?.ipv4_src || '—'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      IPv4 Dst:
                                    </span>
                                    <span className="text-cyan font-mono">
                                      {flow.match?.ipv4_dst || '—'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      TCP Src:
                                    </span>
                                    <span className="text-cyan font-mono">
                                      {flow.match?.tcp_src || '—'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-secondary">
                                      TCP Dst:
                                    </span>
                                    <span className="text-cyan font-mono">
                                      {flow.match?.tcp_dst || '—'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-white text-sm mb-3">
                                  Actions
                                </h4>
                                <div className="space-y-1">
                                  {flow.actions && flow.actions.length > 0 ? (
                                    flow.actions.map((action, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2 rounded text-xs font-mono"
                                        style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, border: '1px solid', color: COLORS.secondary }}
                                      >
                                        {action}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-tertiary text-sm">
                                      No actions defined
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 grid grid-cols-3 gap-4 text-sm" style={{ borderTopColor: COLORS.border, borderTopWidth: '1px' }}>
                              <div>
                                <p className="text-secondary">Priority Rank</p>
                                <p className="text-white font-semibold">
                                  {flow.priority_rank}
                                </p>
                              </div>
                              <div>
                                <p className="text-secondary">Packets/Sec</p>
                                <p className="text-white font-semibold">
                                  {(
                                    flow.packets / Math.max(flow.duration_seconds, 1)
                                  ).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-secondary">Bytes/Sec</p>
                                <p className="text-white font-semibold">
                                  {(
                                    flow.bytes /
                                    Math.max(flow.duration_seconds, 1) /
                                    1024
                                  ).toFixed(2)}{' '}
                                  KB/s
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <p className="text-tertiary">
                        No flows match your criteria
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

// Mock data generator
function generateMockFlows() {
  const dpids = ['00:00:00:00:00:00:00:01', '00:00:00:00:00:00:00:02'];
  const ips = Array.from({ length: 10 }, (_, i) => `192.168.1.${i + 10}`);

  return Array.from({ length: 20 }, (_, i) => ({
    id: `flow-${i}`,
    datapath_id: dpids[i % dpids.length],
    priority: Math.floor(Math.random() * 32700),
    match: {
      eth_type: 2048,
      ipv4_src: ips[Math.floor(Math.random() * ips.length)],
      ipv4_dst: ips[Math.floor(Math.random() * ips.length)],
      tcp_src: Math.floor(Math.random() * 65535),
      tcp_dst: Math.floor(Math.random() * 65535),
    },
    actions: [
      'forward:' + (Math.floor(Math.random() * 4) + 1),
      'set_queue:' + Math.floor(Math.random() * 8),
    ],
    packets: Math.floor(Math.random() * 100000) + 1000,
    bytes: Math.floor(Math.random() * 10000000) + 100000,
    duration_seconds: Math.floor(Math.random() * 3600) + 60,
    priority_rank: i,
  }));
}
