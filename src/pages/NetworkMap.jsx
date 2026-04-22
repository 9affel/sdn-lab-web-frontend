import React, { useEffect, useState } from 'react';
import { Network as NetworkIcon, Router as SwitchIcon, Layers, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getTopology } from '../api/services';
import { COLORS } from '../design-system/constants';

/**
 * Network Topology page - Shows SDN switches and network links
 */
export default function NetworkMap() {
  const [topology, setTopology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopology = async () => {
      try {
        setLoading(true);
        const response = await getTopology();
        setTopology(response.data);
        if (response.data.switches && response.data.switches.length > 0) {
          setSelectedSwitch(response.data.switches[0].id);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching topology:', err);
        setError('Failed to load topology');
        // Use mock data for development
        setTopology({
          switches: [
            {
              id: 's1',
              name: 'Switch-1',
              ip: '10.0.0.1',
              ports: 8,
              flows: 12,
              packets: 45000,
              bytes: 2150000,
            },
            {
              id: 's2',
              name: 'Switch-2',
              ip: '10.0.0.2',
              ports: 8,
              flows: 8,
              packets: 32000,
              bytes: 1520000,
            },
            {
              id: 's3',
              name: 'Switch-3',
              ip: '10.0.0.3',
              ports: 4,
              flows: 5,
              packets: 18000,
              bytes: 890000,
            },
          ],
          links: [
            {
              source: { switch: 's1', port: 1 },
              destination: { switch: 's2', port: 1 },
              bandwidth_mbps: 1000,
              latency_ms: 0.5,
            },
            {
              source: { switch: 's2', port: 2 },
              destination: { switch: 's3', port: 1 },
              bandwidth_mbps: 1000,
              latency_ms: 0.3,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopology();
    const interval = setInterval(fetchTopology, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !topology) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: COLORS.accent.cyan + '40', borderTopColor: COLORS.accent.cyan }}></div>
          <p className="text-secondary">Loading topology...</p>
        </div>
      </div>
    );
  }

  if (!topology) {
    return (
      <div className="text-center py-12">
        <p className="text-red">Failed to load network topology</p>
      </div>
    );
  }

  // Simulate simple grid layout for switch visualization
  const switchPositions = {
    s1: { x: 200, y: 150 },
    s2: { x: 600, y: 150 },
    s3: { x: 400, y: 350 },
  };

  const selectedSwitchData = topology.switches?.find(
    (s) => s.id === selectedSwitch
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Network Topology</h1>
        <p className="text-secondary">
          SDN topology view with switches, ports, and network links
        </p>
      </div>

      {/* Main Layout - Graph + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topology Visualization */}
        <div className="lg:col-span-2">
          <Card style={{ borderColor: COLORS.accent.cyan + '40' }} className="min-h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NetworkIcon className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
                Switch & Link Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <svg width="100%" height="500" className="rounded-lg" style={{ border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.primary }}>
                {/* Draw links between switches */}
                {topology.links?.map((link, idx) => {
                  const sourcePos = switchPositions[link.source.switch];
                  const destPos = switchPositions[link.destination.switch];
                  return (
                    <g key={`link-${idx}`}>
                      <line
                        x1={sourcePos?.x || 0}
                        y1={sourcePos?.y || 0}
                        x2={destPos?.x || 0}
                        y2={destPos?.y || 0}
                        stroke={COLORS.accent.cyan}
                        strokeWidth="2"
                        opacity="0.6"
                      />
                      <text
                        x={(sourcePos?.x || 0 + (destPos?.x || 0)) / 2}
                        y={(sourcePos?.y || 0 + (destPos?.y || 0)) / 2 - 10}
                        fontSize="12"
                        fill={COLORS.tertiary}
                        textAnchor="middle"
                      >
                        {link.bandwidth_mbps}Mbps
                      </text>
                    </g>
                  );
                })}

                {/* Draw switches */}
                {topology.switches?.map((switchItem) => {
                  const pos = switchPositions[switchItem.id] || { x: 100, y: 100 };
                  const isSelected = selectedSwitch === switchItem.id;
                  return (
                    <g
                      key={switchItem.id}
                      onClick={() => setSelectedSwitch(switchItem.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x={pos.x - 40}
                        y={pos.y - 30}
                        width="80"
                        height="60"
                        fill={isSelected ? COLORS.accent.cyan : COLORS.card}
                        stroke={isSelected ? COLORS.accent.cyan : COLORS.tertiary}
                        strokeWidth={isSelected ? '3' : '2'}
                        rx="8"
                      />
                      <text
                        x={pos.x}
                        y={pos.y}
                        fontSize="14"
                        fontWeight="bold"
                        fill={isSelected ? '#ffffff' : COLORS.secondary}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {switchItem.name}
                      </text>
                      <text
                        x={pos.x}
                        y={pos.y + 15}
                        fontSize="11"
                        fill={isSelected ? COLORS.cyan : COLORS.muted}
                        textAnchor="middle"
                      >
                        {switchItem.flows} flows
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Links Legend */}
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-white">Active Links</h3>
                {topology.links?.map((link, idx) => (
                  <div
                    key={`legend-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ backgroundColor: COLORS.primary, borderColor: COLORS.border }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-[2px]" style={{ backgroundColor: COLORS.accent.cyan }}></div>
                      <span className="text-sm text-secondary">
                        {link.source.switch}:{link.source.port} →{' '}
                        {link.destination.switch}:{link.destination.port}
                      </span>
                    </div>
                    <Badge className="text-xs" style={{ backgroundColor: COLORS.accent.cyan + '30', color: COLORS.accent.cyan, borderColor: COLORS.accent.cyan + '50' }}>
                      {link.latency_ms}ms
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Switch Details */}
        <div className="space-y-4">
          {/* Switch List */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SwitchIcon className="w-5 h-5 text-muted" />
                Switches ({topology.switches?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topology.switches?.map((switchItem) => (
                <div
                  key={switchItem.id}
                  onClick={() => setSelectedSwitch(switchItem.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedSwitch === switchItem.id
                      ? ''
                      : ''
                  }`}
                  style={{
                    backgroundColor: selectedSwitch === switchItem.id ? COLORS.accent.cyan + '15' : COLORS.card,
                    borderColor: selectedSwitch === switchItem.id ? COLORS.accent.cyan + '50' : COLORS.border
                  }}
                >
                  <div className="font-semibold text-sm text-white">
                    {switchItem.name}
                  </div>
                  <div className="text-xs text-tertiary mt-1">
                    ID: {switchItem.id}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Switch Details */}
          {selectedSwitchData && (
            <Card style={{ borderColor: COLORS.status.success + '40' }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <SwitchIcon className="w-4 h-4" style={{ color: COLORS.status.success }} />
                  {selectedSwitchData.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-secondary text-sm">IP Address</span>
                    <span className="text-white text-sm font-mono">
                      {selectedSwitchData.ip}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary text-sm">Ports</span>
                    <Badge className="text-xs" style={{ backgroundColor: COLORS.accent.cyan + '30', color: COLORS.accent.cyan }}>
                      {selectedSwitchData.ports}
                    </Badge>
                  </div>
                </div>

                {/* Flow Stats */}
                <div className="border-t" style={{ borderColor: COLORS.border }} style={{ paddingTop: '0.75rem' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4" style={{ color: COLORS.accent.cyan }} />
                    <span className="text-sm font-semibold text-white">
                      Flow Statistics
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-secondary text-sm">Active Flows</span>
                      <span className="text-white text-sm font-semibold">
                        {selectedSwitchData.flows}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary text-sm">Total Packets</span>
                      <span className="text-white text-sm font-semibold">
                        {selectedSwitchData.packets.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary text-sm">Total Bytes</span>
                      <span className="text-white text-sm font-semibold">
                        {(selectedSwitchData.bytes / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Throughput */}
                <div className="rounded-lg p-3" style={{ backgroundColor: COLORS.status.success + '15', borderColor: COLORS.status.success + '40', border: '1px solid' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4" style={{ color: COLORS.status.success }} />
                    <span className="text-xs font-semibold text-white">
                      Data Throughput
                    </span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.status.success }}>
                    {(selectedSwitchData.bytes / 1024 / 1024 / 1024).toFixed(2)} GB
                  </div>
                  <div className="text-xs text-tertiary mt-1">
                    Since monitoring started
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
