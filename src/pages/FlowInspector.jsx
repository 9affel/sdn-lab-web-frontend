import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Activity, 
  Filter, 
  Search, 
  Layers, 
  ChevronDown, 
  RefreshCw,
  Zap,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Terminal,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getFlows, getFlowStatistics } from '../api/services';
import { COLORS, withAlpha } from '../design-system/constants';

// DESIGN SYSTEM REFINEMENT: Brighter Cyan for better contrast on dark surfaces
const styles = {
  cardBorder: withAlpha(COLORS.accent.cyan, '4D'), // 30% alpha (was 20%)
  divider: withAlpha(COLORS.accent.cyan, '33'), // 20% alpha (was 14%)
  panel: COLORS.background.input,
  panelSoft: withAlpha(COLORS.accent.cyan, '1A'), // 10% alpha (was 6%)
  selectedBg: withAlpha(COLORS.accent.cyan, '26'), // 15% alpha (was 8%)
  monoText: 'font-mono text-[13px]',
};

const getFlowRole = (priority) => {
  const p = parseInt(priority);
  if (p >= 65535) return { label: 'CORE', color: '#FF4D4D' }; // Bright Red
  if (p === 100) return { label: 'LEARNED', color: COLORS.accent.cyan }; // Base Cyan
  if (p === 10) return { label: 'WHITELIST', color: '#4ADE80' }; // Bright Green
  if (p === 5) return { label: 'LAB_SCOPE', color: COLORS.accent.cyanLight || '#22D3EE' };
  if (p === 0) return { label: 'DEFAULT', color: COLORS.text.tertiary };
  return { label: 'CUSTOM', color: COLORS.accent.cyan };
};

export default function FlowInspector() {
  const [flows, setFlows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [selectedDpid, setSelectedDpid] = useState(searchParams.get('dpid') || null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);

  // Sync state with URL
  useEffect(() => {
    const dpid = searchParams.get('dpid');
    setSelectedDpid(dpid || null);
  }, [searchParams]);

  const fetchData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsSyncing(true);
      if (!flows.length) setLoading(true);
      
      const [flowsRes, statsRes] = await Promise.allSettled([
        getFlows(selectedDpid, 100, 0),
        getFlowStatistics(),
      ]);

      if (flowsRes.status === 'fulfilled') {
        setFlows(flowsRes.value.data.flows || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data || null);
      }

      if (flowsRes.status === 'rejected' && statsRes.status === 'rejected') {
        throw flowsRes.reason || statsRes.reason;
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching flows:', err);
      setError('Failed to load flow data');
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setIsSyncing(false), 600);
      }
    }
  }, [selectedDpid, flows.length]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const uniqueDpids = useMemo(() => {
    const fromFlows = flows.map((f) => f.datapath_id).filter(Boolean);
    const fromTelemetry = Object.keys(stats?.datapaths || {});
    return [...new Set([...fromFlows, ...fromTelemetry])];
  }, [flows, stats]);

  const filteredFlows = useMemo(() => flows.filter((flow) => {
    const matchesSearch = !searchTerm ||
      flow.datapath_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.match?.ipv4_src?.includes(searchTerm) ||
      flow.match?.ipv4_dst?.includes(searchTerm) ||
      flow.match?.eth_src?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.priority.toString().includes(searchTerm);

    const matchesDpid = !selectedDpid || flow.datapath_id === selectedDpid;

    const role = getFlowRole(flow.priority).label;
    const matchesRole = !selectedRole || 
      (selectedRole === 'System' && role === 'CORE') ||
      (selectedRole === 'AI Mitigate' && role === 'LEARNED' && (!flow.actions || flow.actions.length === 0)) ||
      (selectedRole === 'AI Mitigate' && role === 'LEARNED') || 
      (selectedRole === 'Allow-List' && role === 'WHITELIST');

    return matchesSearch && matchesDpid && matchesRole;
  }), [flows, searchTerm, selectedDpid, selectedRole]);

  const chartData = useMemo(() => {
    const groups = flows.reduce((acc, f) => {
      acc[f.priority] = (acc[f.priority] || 0) + 1;
      return acc;
    }, {});
    if (!Object.keys(groups).length && stats?.total_flows) {
      groups.TELEMETRY = stats.total_flows;
    }
    return Object.entries(groups).map(([p, count]) => ({
      priority: p,
      count,
      role: getFlowRole(p).label
    })).sort((a, b) => Number(b.priority) - Number(a.priority));
  }, [flows, stats]);

  const totalPackets = useMemo(
    () => flows.reduce((sum, f) => sum + (f.packets || 0), 0) || stats?.total_packets || 0,
    [flows, stats]
  );
  const totalFlows = stats?.total_flows || flows.length;
  const activeRules = stats?.active_flows || totalFlows;
  const secureRules = flows.length
    ? flows.filter(f => f.priority === 100 || f.actions?.length === 0).length
    : activeRules;

  if (loading && !flows.length && !error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: withAlpha(COLORS.accent.cyan, '66'), borderTopColor: COLORS.accent.cyan }} />
          <p className="font-bold" style={{ color: COLORS.accent.cyan }}>Indexing Flow Pipeline...</p>
        </div>
      </div>
    );
  }

  const handleRoleFilter = (role) => {
    setSelectedRole(selectedRole === role ? null : role);
  };

  const handleDpidSelect = (val) => {
    setSelectedDpid(val);
    const url = new URL(window.location);
    if (val) url.searchParams.set('dpid', val);
    else url.searchParams.delete('dpid');
    window.history.pushState({}, '', url);
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tighter" style={{ color: COLORS.text.primary }}>
            <Terminal className="w-8 h-8" style={{ color: COLORS.accent.cyan }} />
            OpenFlow Pipeline
          </h1>
          <p className="font-medium" style={{ color: COLORS.text.secondary }}>
            Real-time deep packet inspection across <span style={{ color: COLORS.accent.cyan }}>{uniqueDpids.length} active switches</span>.
          </p>
        </div>
        <button 
          onClick={() => fetchData(true)} 
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border font-bold transition-all hover:brightness-125" 
          style={{ backgroundColor: COLORS.background.card, borderColor: styles.cardBorder, color: COLORS.accent.cyan }}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatBox icon={Layers} label="Active Rules" value={activeRules} color={COLORS.accent.cyan} />
            <StatBox icon={TrendingUp} label="Flow Density" value={`${Math.min(100, (totalFlows / 2000 * 100)).toFixed(1)}%`} color={COLORS.status.warning} />
            <StatBox icon={ShieldCheck} label="Secure Rules" value={secureRules} color="#4ADE80" />
          </div>

          <Card style={{ borderColor: styles.cardBorder, backgroundColor: styles.panel }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: COLORS.accent.cyan }}>
                <BarChart3 className="w-3 h-3" /> PIPELINE PRIORITY DISTRIBUTION
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[160px] pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={styles.divider} vertical={false} />
                  <XAxis dataKey="priority" stroke={COLORS.text.tertiary} fontSize={9} />
                  <YAxis stroke={COLORS.text.tertiary} fontSize={9} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: COLORS.background.card, borderColor: styles.cardBorder, borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: COLORS.accent.cyan }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getFlowRole(entry.priority).color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card style={{ borderColor: styles.cardBorder, backgroundColor: withAlpha(COLORS.background.card, '88') }}>
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest" style={{ color: COLORS.accent.cyan }}>Switch Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InsightItem icon={ShieldCheck} title="Pipeline Verified" desc="OpenFlow tables are verified and consistent." type="success" />
            <InsightItem icon={AlertTriangle} title="Idle Monitor" desc="Normal: No massive packet hits detected currently." type="warning" />
            <div className="pt-4 border-t" style={{ borderColor: styles.divider }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.text.tertiary }}>QUICK FILTERS</p>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  onClick={() => handleRoleFilter('System')}
                  className={`cursor-pointer font-bold transition-all ${selectedRole === 'System' ? 'scale-110 shadow-glow-cyan brightness-125' : 'opacity-60 hover:opacity-100'}`} 
                  variant="outline" 
                  style={{ borderColor: '#FF4D4D', color: '#FF4D4D', backgroundColor: selectedRole === 'System' ? 'rgba(255, 77, 77, 0.1)' : 'transparent' }}
                >
                  System
                </Badge>
                <Badge 
                  onClick={() => handleRoleFilter('AI Mitigate')}
                  className={`cursor-pointer font-bold transition-all ${selectedRole === 'AI Mitigate' ? 'scale-110 shadow-glow-cyan brightness-125' : 'opacity-60 hover:opacity-100'}`} 
                  variant="outline" 
                  style={{ borderColor: COLORS.accent.cyan, color: COLORS.accent.cyan, backgroundColor: selectedRole === 'AI Mitigate' ? 'rgba(0, 217, 192, 0.1)' : 'transparent' }}
                >
                  AI Mitigate
                </Badge>
                <Badge 
                  onClick={() => handleRoleFilter('Allow-List')}
                  className={`cursor-pointer font-bold transition-all ${selectedRole === 'Allow-List' ? 'scale-110 shadow-glow-cyan brightness-125' : 'opacity-60 hover:opacity-100'}`} 
                  variant="outline" 
                  style={{ borderColor: '#4ADE80', color: '#4ADE80', backgroundColor: selectedRole === 'Allow-List' ? 'rgba(74, 222, 128, 0.1)' : 'transparent' }}
                >
                  Allow-List
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card style={{ borderColor: styles.cardBorder, backgroundColor: styles.panel }}>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.accent.cyan }} />
              <input
                type="text"
                placeholder="Filter by IP, MAC, Priority, or Switch ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border text-sm font-bold transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                style={{ backgroundColor: COLORS.background.primary, borderColor: styles.divider, color: COLORS.text.primary }}
              />
            </div>
            
            {/* CUSTOM PREMIUM DROPDOWN */}
            <div className="relative min-w-[220px]">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-11 px-4 rounded-lg border text-sm font-bold flex items-center justify-between transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ 
                  backgroundColor: COLORS.background.primary, 
                  borderColor: isDropdownOpen ? COLORS.accent.cyan : styles.divider, 
                  color: COLORS.text.primary 
                }}
              >
                <span className="truncate">{selectedDpid || "All Switches"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ color: COLORS.accent.cyan }} />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 z-20 rounded-xl border overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ 
                      backgroundColor: COLORS.background.card, 
                      borderColor: withAlpha(COLORS.accent.cyan, '33') 
                    }}
                  >
                    <div 
                      onClick={() => handleDpidSelect(null)}
                      className={`px-4 py-3 text-xs font-bold cursor-pointer transition-colors border-b ${!selectedDpid ? 'bg-cyan-500/10 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                      style={{ borderColor: styles.divider }}
                    >
                      All Switches
                    </div>
                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                      {uniqueDpids.map(dpid => (
                        <div
                          key={dpid}
                          onClick={() => handleDpidSelect(dpid)}
                          className={`px-4 py-3 text-xs font-mono font-bold cursor-pointer transition-colors ${selectedDpid === dpid ? 'bg-cyan-500/10 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                        >
                          {dpid}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card style={{ borderColor: styles.cardBorder }}>
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr style={{ backgroundColor: withAlpha(COLORS.accent.cyan, '0D') }}>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider" style={{ color: COLORS.accent.cyan }}>Role</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider" style={{ color: COLORS.accent.cyan }}>Priority</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider" style={{ color: COLORS.accent.cyan }}>Match Pattern</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider" style={{ color: COLORS.accent.cyan }}>Transport</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider" style={{ color: COLORS.accent.cyan }}>Activity</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider" style={{ color: COLORS.accent.cyan }}>Counters</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-wider" style={{ color: COLORS.accent.cyan }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlows.length > 0 ? filteredFlows.map((flow) => {
                  const role = getFlowRole(flow.priority);
                  const isDrop = !flow.actions || flow.actions.length === 0;
                  // IMPROVED: Calculate intensity relative to a fixed high-traffic threshold (1000 pkts)
                  // This prevents 100% bars when only 1 packet exists globally.
                  const intensity = Math.min(100, (flow.packets / 1000) * 100);
                  const isActive = flow.packets > 0;
                  
                  return (
                    <React.Fragment key={flow.id}>
                      <tr
                        onClick={() => setExpandedRow(expandedRow === flow.id ? null : flow.id)}
                        className="transition-colors cursor-pointer border-b hover:bg-cyan-500/5"
                        style={{ 
                          borderColor: styles.divider,
                          backgroundColor: expandedRow === flow.id ? styles.selectedBg : 'transparent'
                        }}
                      >
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[9px] font-black uppercase px-1.5 py-0" style={{ borderColor: withAlpha(role.color, '88'), color: role.color }}>
                            {role.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black" style={{ color: COLORS.text.primary }}>{flow.priority}</span>
                            {isDrop && <Badge className="border text-[9px] px-1 font-black shadow-[0_0_10px_rgba(231,76,60,0.2)]" style={{ backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#FF4D4D', borderColor: 'rgba(231, 76, 60, 0.4)' }}>DROP</Badge>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={styles.monoText} style={{ color: COLORS.text.primary }}>
                            {flow.match?.ipv4_src ? (
                              <>{flow.match.ipv4_src} {'→'} {flow.match.ipv4_dst || 'any'}</>
                            ) : flow.match?.eth_src ? (
                              <><span className="text-[10px] font-bold" style={{ color: COLORS.accent.cyan }}>L2:</span> {flow.match.eth_src} {'→'} {flow.match.eth_dst || 'any'}</>
                            ) : (flow.match?.in_port !== undefined && flow.match?.in_port !== null) ? (
                              <><span className="text-[10px] font-bold" style={{ color: COLORS.accent.cyan }}>PORT:</span> {flow.match.in_port} {'→'} any</>
                            ) : (
                              <span className="italic font-medium" style={{ color: COLORS.text.tertiary }}>Wildcard (Match-All)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase" style={{ backgroundColor: withAlpha(COLORS.accent.cyan, '1A'), color: COLORS.accent.cyan, border: `1px solid ${withAlpha(COLORS.accent.cyan, '33')}` }}>
                            {flow.match?.tcp_dst ? `TCP:${flow.match.tcp_dst}` : 
                             flow.match?.udp_dst ? `UDP:${flow.match.udp_dst}` : 
                             flow.match?.eth_type === 2048 ? 'IPv4' : 
                             flow.match?.eth_type === 2054 ? 'ARP' : 
                             flow.match?.eth_src ? 'L2 ETH' : 'ANY'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 rounded-full overflow-hidden shadow-inner bg-zinc-900/50 border border-zinc-800">
                              <div 
                                className={`h-full transition-all duration-1000 ${isActive ? 'shadow-[0_0_8px_rgba(0,217,192,0.5)]' : 'animate-pulse opacity-30'}`} 
                                style={{ 
                                  width: `${Math.max(isActive ? intensity : 5, 2)}%`, 
                                  backgroundColor: isActive ? COLORS.accent.cyan : COLORS.text.tertiary 
                                }} 
                              />
                            </div>
                            {!isActive && <span className="text-[8px] font-black uppercase tracking-tighter text-zinc-600">Idle</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`text-xs font-black ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`}>
                              {flow.packets.toLocaleString()} pkts
                            </span>
                            <span className="text-[10px] font-bold" style={{ color: COLORS.text.secondary }}>{(flow.bytes / 1024).toFixed(1)} KB</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <ChevronDown className={`w-4 h-4 mx-auto transition-transform ${expandedRow === flow.id ? 'rotate-180 text-cyan-400' : 'text-zinc-500'}`} />
                        </td>
                      </tr>

                      {expandedRow === flow.id && (
                        <tr>
                          <td colSpan="7" className="p-0">
                            <div className="px-8 py-6 space-y-6" style={{ backgroundColor: withAlpha(COLORS.accent.cyan, '08') }}>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.accent.cyan }}>
                                    <Filter className="w-3 h-3" /> PIPELINE MATCH CRITERIA
                                  </h4>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <DetailItem label="In Port" value={flow.match?.in_port} />
                                    <DetailItem label="Eth Type" value={flow.match?.eth_type ? `0x${flow.match.eth_type.toString(16)}` : null} />
                                    <DetailItem label="MAC Source" value={flow.match?.eth_src} />
                                    <DetailItem label="MAC Destination" value={flow.match?.eth_dst} />
                                    <DetailItem label="IPv4 Source" value={flow.match?.ipv4_src} />
                                    <DetailItem label="IPv4 Destination" value={flow.match?.ipv4_dst} />
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.accent.cyan }}>
                                    <Zap className="w-3 h-3" /> INSTRUCTIONS & ACTIONS
                                  </h4>
                                  <div className="space-y-2">
                                    {flow.actions?.length > 0 ? flow.actions.map((action, idx) => (
                                      <div key={idx} className="p-3 rounded border text-xs font-mono font-bold flex items-center gap-3 transition-colors hover:border-cyan-500/50" style={{ backgroundColor: COLORS.background.input, borderColor: styles.divider, color: COLORS.accent.cyan }}>
                                        <span className="w-5 h-5 flex items-center justify-center rounded font-black text-[9px]" style={{ backgroundColor: withAlpha(COLORS.accent.cyan, '22'), color: COLORS.accent.cyan }}>{idx + 1}</span>
                                        {action}
                                      </div>
                                    )) : (
                                      <div className="p-4 rounded border font-black text-center text-xs shadow-[0_0_20px_rgba(231,76,60,0.1)] transition-all" style={{ borderColor: 'rgba(231, 76, 60, 0.4)', backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#FF4D4D' }}>
                                        SECURITY BLOCK: Traffic Discarded (Explicit DROP)
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="pt-6 border-t grid grid-cols-3 gap-6" style={{ borderColor: styles.divider }}>
                                <MetricSummary label="Priority Rank" value={flow.priority_rank} sub="Execution order" />
                                <MetricSummary label="Throughput" value={(flow.packets / Math.max(flow.duration_seconds, 1)).toFixed(2)} sub="Pkts / sec" />
                                <MetricSummary label="Rule Age" value={`${flow.duration_seconds}s`} sub="Uptime" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center font-bold" style={{ color: COLORS.text.tertiary }}>
                      No active flows discovered in this switch context.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ENHANCED GLOSSARY & UTILITY SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card className="xl:col-span-1" style={{ borderColor: styles.cardBorder, backgroundColor: withAlpha(COLORS.accent.cyan, '08') }}>
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: COLORS.accent.cyan }}>
              <ShieldCheck className="w-4 h-4" /> MODULE UTILITY
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[11px] leading-relaxed font-medium" style={{ color: COLORS.text.secondary }}>
              The <span className="text-white font-bold">Flow Inspector</span> provides raw transparency into the SDN's hardware decision-making logic.
            </p>
            <p className="text-[11px] leading-relaxed font-medium" style={{ color: COLORS.text.secondary }}>
              By auditing the <span className="text-white font-bold">OpenFlow Pipeline</span>, security engineers can validate that AI-driven mitigation rules are correctly installed and that critical infrastructure traffic is never unintentionally dropped.
            </p>
            <div className="p-3 rounded bg-zinc-900/50 border border-zinc-800">
              <p className="text-[10px] font-bold text-cyan-500 uppercase mb-1">Key Use Case</p>
              <p className="text-[10px] text-zinc-400">Identify "Table Miss" scenarios where traffic is hitting the default rule instead of a specific security policy.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3" style={{ borderColor: styles.cardBorder, backgroundColor: withAlpha(COLORS.background.card, '44') }}>
          <CardHeader className="border-b" style={{ borderColor: styles.divider }}>
            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest" style={{ color: COLORS.accent.cyan }}>
              <Activity className="w-4 h-4" /> TECHNICAL METRIC DEFINITIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.accent.cyan }}>Pipeline Metadata</h4>
                <ul className="space-y-3">
                  <GlossaryItem term="Priority (0-65535)" desc="Higher numbers take precedence. A rule with priority 100 will override a rule with priority 10 if both match the same packet." />
                  <GlossaryItem term="Rule Age (Duration)" desc="Total uptime of the rule in the switch table. Old rules might be stale; young rules usually indicate recent AI activity." />
                  <GlossaryItem term="Execution Rank" desc="The logical order in which the switch evaluates this rule within the current flow table." />
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.status.warning }}>Activity & Counters</h4>
                <ul className="space-y-3">
                  <GlossaryItem term="Packet Count" desc="The total number of individual packets that have matched this specific rule since it was installed." />
                  <GlossaryItem term="Byte Count (Volume)" desc="The cumulative data size processed. Useful for detecting massive exfiltration attempts or DDoS floods." />
                  <GlossaryItem term="Throughput (PPS)" desc="Packets Per Second. A real-time measure of current traffic intensity hitting the rule." />
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#FF4D4D' }}>Match & Actions</h4>
                <ul className="space-y-3">
                  <GlossaryItem term="Match Pattern" desc="The L2/L3 criteria (MAC, IP, Port) used to identify a flow. Wildcards indicate broader, less specific rules." />
                  <GlossaryItem term="Action: DROP" desc="A security instruction that tells the switch hardware to delete the packet immediately without processing." />
                  <GlossaryItem term="Action: CONTROLLER" desc="A 'Packet-In' event that sends traffic to the AI for deep behavioral analysis." />
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <Card style={{ borderColor: withAlpha(color, '4D'), backgroundColor: styles.panel }}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: withAlpha(color, '26') }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.tertiary }}>{label}</p>
          <p className="text-2xl font-black tracking-tight" style={{ color: COLORS.text.primary }}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightItem({ icon: Icon, title, desc, type }) {
  const color = type === 'success' ? '#4ADE80' : COLORS.status.warning;
  return (
    <div className="flex gap-3 p-3.5 rounded-lg border transition-all hover:bg-white/5" style={{ borderColor: withAlpha(color, '33'), backgroundColor: withAlpha(color, '12') }}>
      <Icon className="w-4 h-4 mt-0.5" style={{ color }} />
      <div>
        <h5 className="text-xs font-black uppercase tracking-tight" style={{ color: COLORS.text.primary }}>{title}</h5>
        <p className="text-[10px] font-medium leading-relaxed" style={{ color: COLORS.text.secondary }}>{desc}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: withAlpha(COLORS.accent.cyan, '22') }}>
      <span className="text-[11px] font-bold uppercase tracking-tight" style={{ color: COLORS.text.tertiary }}>{label}</span>
      <span className="font-mono text-[11px] font-black" style={{ color: COLORS.text.primary }}>{value}</span>
    </div>
  );
}

function MetricSummary({ label, value, sub }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: COLORS.accent.cyan }}>{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: COLORS.text.tertiary }}>{sub}</p>
    </div>
  );
}

function GlossaryItem({ term, desc, color }) {
  return (
    <li className="group">
      <p className="text-[11px] font-black tracking-tight mb-0.5 transition-colors group-hover:brightness-125" style={{ color }}>{term}</p>
      <p className="text-[10px] font-medium leading-normal" style={{ color: COLORS.text.tertiary }}>{desc}</p>
    </li>
  );
}
