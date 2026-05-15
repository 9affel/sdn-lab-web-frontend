import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Database,
  Factory,
  History,
  Network as NetworkIcon,
  Router as SwitchIcon,
  Server,
  ShieldAlert,
  SlidersHorizontal,
  UserRound,
  Waves,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getTopology } from '../api/services';
import { COLORS } from '../design-system/constants';

const withAlpha = (color, alphaHex) => `${color}${alphaHex}`;

const styles = {
  cardBorder: withAlpha(COLORS.accent.cyan, '33'),
  divider: withAlpha(COLORS.accent.cyan, '24'),
  panel: withAlpha(COLORS.background.input, '99'),
  panelSoft: withAlpha(COLORS.accent.cyan, '0F'),
  selected: withAlpha(COLORS.accent.cyan, '14'),
  selectedBorder: withAlpha(COLORS.accent.cyan, '66'),
  dangerPanel: withAlpha(COLORS.status.danger, '14'),
  dangerBorder: withAlpha(COLORS.status.danger, '47'),
  warningPanel: withAlpha(COLORS.status.warning, '12'),
  warningBorder: withAlpha(COLORS.status.warning, '3D'),
  neutralPanel: withAlpha(COLORS.text.tertiary, '1F'),
  neutralBorder: withAlpha(COLORS.text.tertiary, '4D'),
  mutedBorder: withAlpha(COLORS.border.default, '80'),
};

const isHostNode = (node) => node.id?.startsWith('h_') || node.name?.toLowerCase().startsWith('h_');
const normalizeName = (node) => `${node.name || node.id || ''}`.toLowerCase();

const classifyEndpoint = (node) => {
  const label = normalizeName(node);
  if (label.includes('attacker')) {
    return {
      plane: 'user',
      role: 'Network User',
      subtype: 'Attacker',
      Icon: ShieldAlert,
      accent: COLORS.status.danger,
      bg: styles.dangerPanel,
      border: styles.dangerBorder,
    };
  }
  if (label.includes('plc')) {
    return {
      plane: 'factory',
      role: 'Smart Factory',
      subtype: 'PLC',
      Icon: Cpu,
      accent: COLORS.status.warning,
      bg: styles.warningPanel,
      border: styles.warningBorder,
    };
  }
  if (label.includes('sensor') || label.includes('iot')) {
    return {
      plane: 'factory',
      role: 'Smart Factory',
      subtype: 'Sensor',
      Icon: Waves,
      accent: COLORS.accent.cyan,
      bg: styles.panelSoft,
      border: styles.cardBorder,
    };
  }
  if (label.includes('hmi') || label.includes('scada')) {
    return {
      plane: 'factory',
      role: 'Smart Factory',
      subtype: 'HMI / SCADA',
      Icon: SlidersHorizontal,
      accent: COLORS.accent.cyan,
      bg: styles.panelSoft,
      border: styles.cardBorder,
    };
  }
  if (label.includes('server') || label.includes('historian') || label.includes('db')) {
    return {
      plane: 'factory',
      role: 'Smart Factory',
      subtype: 'Server',
      Icon: Server,
      accent: COLORS.accent.cyan,
      bg: styles.panelSoft,
      border: styles.cardBorder,
    };
  }
  return {
    plane: 'user',
    role: 'Network User',
    subtype: 'Endpoint',
    Icon: UserRound,
    accent: COLORS.text.muted,
    bg: styles.neutralPanel,
    border: styles.neutralBorder,
  };
};

const getNodeMetrics = (node) => [
  { label: 'Ports', value: node.ports ?? 0, source: 'API: /api/v1/topology' },
  { label: 'Flows', value: node.flows ?? 0, source: 'API: /api/v1/topology' },
  { label: 'Packets', value: (node.packets ?? 0).toLocaleString(), source: 'API: /api/v1/topology' },
  { label: 'Bytes', value: `${((node.bytes ?? 0) / 1024 / 1024).toFixed(2)} MB`, source: 'API: /api/v1/topology' },
];

const getSwitchLinks = (switchId, links = []) =>
  links.filter((link) => link.source.switch === switchId || link.destination.switch === switchId);

const otherSide = (link, nodeId) =>
  link.source.switch === nodeId ? link.destination : link.source;

export default function NetworkMap() {
  const [topology, setTopology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopology = async () => {
      try {
        setLoading(true);
        const response = await getTopology();
        setTopology(response.data);
        const firstSwitch = response.data.switches?.find((node) => !isHostNode(node));
        const firstNode = firstSwitch || response.data.switches?.[0];
        if (firstNode) setSelectedNodeId((current) => current || firstNode.id);
        setError(null);
      } catch (err) {
        console.error('Error fetching topology:', err);
        setError('Failed to load topology');
        setTopology(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTopology();
    const pollInterval = import.meta.env.VITE_STATUS_POLL_INTERVAL || 5000;
    const interval = setInterval(fetchTopology, pollInterval);
    return () => clearInterval(interval);
  }, []);

  const topologyModel = useMemo(() => {
    const nodes = topology?.switches || [];
    const links = topology?.links || [];
    const dataPlaneSwitches = nodes.filter((node) => !isHostNode(node));
    const endpoints = nodes.filter(isHostNode).map((node) => ({
      ...node,
      classification: classifyEndpoint(node),
    }));
    const factoryEndpoints = endpoints.filter((node) => node.classification.plane === 'factory');
    const userEndpoints = endpoints.filter((node) => node.classification.plane === 'user');
    return { dataPlaneSwitches, endpoints, factoryEndpoints, userEndpoints, links };
  }, [topology]);

  const nodePositions = useMemo(() => {
    const positions = {};
    const spread = (items, y, startX, endX) => {
      items.forEach((node, idx) => {
        const step = items.length > 1 ? (endX - startX) / (items.length - 1) : 0;
        positions[node.id] = { x: items.length > 1 ? startX + step * idx : (startX + endX) / 2, y };
      });
    };

    positions.__controller = { x: 400, y: 70 };
    spread(topologyModel.dataPlaneSwitches, 225, 180, 620);
    spread(topologyModel.factoryEndpoints, 385, 140, 500);
    spread(topologyModel.userEndpoints, 385, 560, 700);
    return positions;
  }, [topologyModel.dataPlaneSwitches, topologyModel.factoryEndpoints, topologyModel.userEndpoints]);

  if (loading && !topology) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: withAlpha(COLORS.accent.cyan, '40'), borderTopColor: COLORS.accent.cyan }}
          />
          <p style={{ color: COLORS.text.secondary }}>Loading topology...</p>
        </div>
      </div>
    );
  }

  if (!topology || error) {
    return (
      <div className="text-center py-12">
        <div
          className="border p-4 rounded-lg inline-block"
          style={{ backgroundColor: styles.dangerPanel, borderColor: styles.dangerBorder, color: COLORS.status.danger }}
        >
          <p className="font-semibold">{error || 'Failed to load network topology'}</p>
          <p className="text-sm mt-1 opacity-80">Check backend connectivity or Ryu controller status</p>
        </div>
      </div>
    );
  }

  const selectedNode = topology.switches?.find((node) => node.id === selectedNodeId);
  const selectedIsSwitch = selectedNode && !isHostNode(selectedNode);
  const selectedEndpoint = selectedNode && isHostNode(selectedNode)
    ? { ...selectedNode, classification: classifyEndpoint(selectedNode) }
    : null;
  const selectedLinks = selectedNode ? getSwitchLinks(selectedNode.id, topologyModel.links) : [];

  const kpiCards = [
    {
      title: 'Data-Plane Switches',
      value: topologyModel.dataPlaneSwitches.length,
      subtitle: 'OpenFlow datapaths',
      Icon: SwitchIcon,
      color: COLORS.accent.cyan,
    },
    {
      title: 'Factory Endpoints',
      value: topologyModel.factoryEndpoints.length,
      subtitle: 'PLC, sensors, HMI, servers',
      Icon: Factory,
      color: COLORS.status.warning,
    },
    {
      title: 'Network Users',
      value: topologyModel.userEndpoints.length,
      subtitle: 'Operators and attacker hosts',
      Icon: UserRound,
      color: COLORS.text.muted,
    },
    {
      title: 'Active Links',
      value: topologyModel.links.length,
      subtitle: 'Ryu topology links',
      Icon: NetworkIcon,
      color: COLORS.accent.cyan,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>Network Topology</h1>
        <p style={{ color: COLORS.text.secondary }}>
          SDN control plane, OpenFlow datapaths, smart-factory endpoints, and network users
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiCards.map(({ title, value, subtitle, Icon, color }) => (
          <Card key={title} style={{ borderColor: withAlpha(color, '4D') }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: withAlpha(color, '1A') }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border" style={{ backgroundColor: styles.panel, borderColor: styles.divider }}>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: color }} />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.text.secondary }}>live</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium" style={{ color: COLORS.text.secondary }}>{title}</p>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs" style={{ color: COLORS.text.tertiary }}>{subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card style={{ borderColor: styles.cardBorder }} className="min-h-[680px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NetworkIcon className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
                SDN + Smart Factory Topology
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b" style={{ borderColor: styles.divider, backgroundColor: styles.panel }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <PlaneLegend label="Control Plane" value="Ryu SDN Controller" color={COLORS.accent.cyan} />
                  <PlaneLegend label="Data Plane" value={`${topologyModel.dataPlaneSwitches.length} OpenFlow switches`} color={COLORS.accent.cyan} />
                  <PlaneLegend label="Endpoints" value={`${topologyModel.endpoints.length} hosts classified`} color={COLORS.status.warning} />
                </div>
              </div>

              <div className="relative w-full aspect-[8/5] max-h-[560px] overflow-hidden" style={{ backgroundColor: styles.panel }}>
                <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                  <defs>
                    <filter id="nodeGlow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <text x="36" y="36" fontSize="12" fontWeight="700" fill={COLORS.text.tertiary}>CONTROL PLANE</text>
                  <text x="36" y="192" fontSize="12" fontWeight="700" fill={COLORS.text.tertiary}>DATA PLANE</text>
                  <text x="36" y="352" fontSize="12" fontWeight="700" fill={COLORS.text.tertiary}>FACTORY / USERS</text>

                  {topologyModel.dataPlaneSwitches.map((sw) => {
                    const source = nodePositions.__controller;
                    const dest = nodePositions[sw.id];
                    return (
                      <line
                        key={`control-${sw.id}`}
                        x1={source.x}
                        y1={source.y + 32}
                        x2={dest?.x || 0}
                        y2={(dest?.y || 0) - 44}
                        stroke={COLORS.accent.cyan}
                        strokeWidth="1.5"
                        strokeDasharray="6 8"
                        opacity="0.45"
                      />
                    );
                  })}

                  {topologyModel.links.map((link, idx) => {
                    const sourcePos = nodePositions[link.source.switch];
                    const destPos = nodePositions[link.destination.switch];
                    if (!sourcePos || !destPos) return null;
                    return (
                      <g key={`link-${idx}`}>
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={destPos.x}
                          y2={destPos.y}
                          stroke={COLORS.accent.cyan}
                          strokeWidth="2"
                          opacity="0.65"
                        />
                        <text
                          x={(sourcePos.x + destPos.x) / 2}
                          y={(sourcePos.y + destPos.y) / 2 - 10}
                          fontSize="11"
                          fill={COLORS.text.tertiary}
                          textAnchor="middle"
                        >
                          {link.source.port} - {link.destination.port}
                        </text>
                      </g>
                    );
                  })}

                  <ControllerNode position={nodePositions.__controller} />

                  {topologyModel.dataPlaneSwitches.map((node) => (
                    <SwitchNode
                      key={node.id}
                      node={node}
                      position={nodePositions[node.id]}
                      selected={selectedNodeId === node.id}
                      onSelect={() => setSelectedNodeId(node.id)}
                    />
                  ))}

                  {topologyModel.endpoints.map((node) => (
                    <EndpointNode
                      key={node.id}
                      node={node}
                      position={nodePositions[node.id]}
                      selected={selectedNodeId === node.id}
                      onSelect={() => setSelectedNodeId(node.id)}
                    />
                  ))}
                </svg>
              </div>

              <div className="space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>Active Links</h3>
                  <span className="text-xs" style={{ color: COLORS.text.tertiary }}>Ports and latency are backend topology fields</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {topologyModel.links.map((link, idx) => (
                    <LinkRow key={`legend-${idx}`} link={link} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <NodeList
            title="SDN Data Plane"
            Icon={SwitchIcon}
            nodes={topologyModel.dataPlaneSwitches}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
            helper="OpenFlow switches from Ryu topology"
          />

          <NodeList
            title="Smart Factory Network"
            Icon={Factory}
            nodes={topologyModel.factoryEndpoints}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
            helper="Factory endpoints classified by host naming"
          />

          <NodeList
            title="Network Users"
            Icon={UserRound}
            nodes={topologyModel.userEndpoints}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
            helper="User endpoints, including attacker hosts"
          />
        </div>
      </div>

      {selectedNode && (
        <Card style={{ borderColor: styles.cardBorder }}>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="flex items-center gap-2">
                {selectedIsSwitch ? (
                  <SwitchIcon className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
                ) : (
                  <selectedEndpoint.classification.Icon className="w-5 h-5" style={{ color: selectedEndpoint.classification.accent }} />
                )}
                {selectedNode.name}
              </CardTitle>
              {selectedIsSwitch ? (
                <Link
                  to={`/flows?dpid=${encodeURIComponent(selectedNode.id)}`}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors hover:underline"
                  style={{ color: COLORS.accent.cyan, borderColor: styles.cardBorder, backgroundColor: styles.panelSoft }}
                >
                  <History className="w-4 h-4" />
                  View History Flows
                </Link>
              ) : (
                <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                  Flow history is available on the connected OpenFlow switch.
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-3">
                {getNodeMetrics(selectedNode).map((metric) => (
                  <MetricTile key={metric.label} {...metric} />
                ))}
              </div>
              <div className="rounded-lg border p-4" style={{ backgroundColor: styles.panel, borderColor: styles.divider }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.text.tertiary }}>Classification</p>
                <p className="text-lg font-bold" style={{ color: selectedIsSwitch ? COLORS.accent.cyan : selectedEndpoint.classification.accent }}>
                  {selectedIsSwitch ? 'SDN Data-Plane Switch' : selectedEndpoint.classification.subtype}
                </p>
                <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
                  {selectedIsSwitch ? 'Controlled by the SDN controller through OpenFlow.' : selectedEndpoint.classification.role}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t" style={{ borderTopColor: styles.divider }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>Connected Interfaces</h3>
                <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
                  Source: /api/v1/topology
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedLinks.length > 0 ? (
                  selectedLinks.map((link, idx) => (
                    <InterfaceRow key={`interface-${idx}`} nodeId={selectedNode.id} link={link} />
                  ))
                ) : (
                  <p className="text-sm" style={{ color: COLORS.text.tertiary }}>No interfaces reported for this node.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card style={{ borderColor: styles.cardBorder }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
            Metric Binding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SourceTile title="Topology nodes" source="API: /api/v1/topology" detail="switches, hosts, ports, packets, bytes, flows" />
            <SourceTile title="Interfaces and links" source="API: /api/v1/topology" detail="source port, destination port, bandwidth, latency" />
            <SourceTile title="Flow history" source="API: /api/v1/flows" detail="OpenFlow rules; persisted by backend to MongoDB flows collection" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlaneLegend({ label, value, color }) {
  return (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: styles.divider, backgroundColor: styles.panelSoft }}>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.text.tertiary }}>{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold" style={{ color: COLORS.text.primary }}>{value}</p>
    </div>
  );
}

function ControllerNode({ position }) {
  return (
    <g>
      <rect
        x={position.x - 80}
        y={position.y - 28}
        width="160"
        height="56"
        rx="8"
        fill={COLORS.background.card}
        stroke={COLORS.accent.cyan}
        strokeWidth="2"
        filter="url(#nodeGlow)"
      />
      <text x={position.x} y={position.y - 6} fontSize="13" fontWeight="700" fill={COLORS.text.primary} textAnchor="middle">
        SDN Controller
      </text>
      <text x={position.x} y={position.y + 14} fontSize="10" fill={COLORS.text.tertiary} textAnchor="middle">
        Control Plane
      </text>
    </g>
  );
}

function SwitchNode({ node, position, selected, onSelect }) {
  if (!position) return null;
  return (
    <g onClick={onSelect} style={{ cursor: 'pointer' }}>
      <rect
        x={position.x - 52}
        y={position.y - 36}
        width="104"
        height="72"
        rx="8"
        fill={selected ? withAlpha(COLORS.accent.cyan, '24') : COLORS.background.card}
        stroke={selected ? COLORS.accent.cyan : styles.cardBorder}
        strokeWidth={selected ? '3' : '2'}
      />
      <text x={position.x} y={position.y - 8} fontSize="13" fontWeight="700" fill={COLORS.text.primary} textAnchor="middle">
        {node.name}
      </text>
      <text x={position.x} y={position.y + 12} fontSize="10" fill={COLORS.text.tertiary} textAnchor="middle">
        {node.flows} flows / {node.ports} ports
      </text>
    </g>
  );
}

function EndpointNode({ node, position, selected, onSelect }) {
  if (!position) return null;
  const { classification } = node;
  return (
    <g onClick={onSelect} style={{ cursor: 'pointer' }}>
      <circle
        cx={position.x}
        cy={position.y}
        r="38"
        fill={selected ? classification.bg : COLORS.background.card}
        stroke={selected ? classification.accent : classification.border}
        strokeWidth={selected ? '3' : '2'}
      />
      <text x={position.x} y={position.y - 9} fontSize="12" fontWeight="700" fill={classification.accent} textAnchor="middle">
        {node.name}
      </text>
      <text x={position.x} y={position.y + 10} fontSize="10" fill={COLORS.text.secondary} textAnchor="middle">
        {classification.subtype}
      </text>
    </g>
  );
}

function NodeList({ title, Icon, nodes, selectedNodeId, onSelect, helper }) {
  return (
    <Card style={{ borderColor: styles.cardBorder }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="w-4 h-4" style={{ color: COLORS.accent.cyan }} />
          {title} ({nodes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs pb-2" style={{ color: COLORS.text.tertiary }}>{helper}</p>
        {nodes.length > 0 ? (
          nodes.map((node) => {
            const isEndpoint = isHostNode(node);
            const classification = isEndpoint ? classifyEndpoint(node) : null;
            const selected = selectedNodeId === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => onSelect(node.id)}
                className="w-full rounded-lg border p-3 text-left transition-all"
                style={{
                  backgroundColor: selected ? styles.selected : COLORS.background.card,
                  borderColor: selected ? styles.selectedBorder : COLORS.border.default,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>{node.name}</span>
                  {classification && (
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: classification.accent, borderColor: classification.border, backgroundColor: classification.bg }}>
                      {classification.subtype}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-mono" style={{ color: COLORS.text.tertiary }}>ID: {node.id}</p>
              </button>
            );
          })
        ) : (
          <p className="text-sm" style={{ color: COLORS.text.tertiary }}>No nodes reported.</p>
        )}
      </CardContent>
    </Card>
  );
}

function LinkRow({ link }) {
  return (
    <div className="rounded-lg border p-3" style={{ backgroundColor: styles.panelSoft, borderColor: styles.mutedBorder }}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: COLORS.accent.cyan }} />
          <span className="text-sm font-mono" style={{ color: COLORS.text.secondary }}>
            {link.source.switch}:{link.source.port} {'->'} {link.destination.switch}:{link.destination.port}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: COLORS.text.tertiary }}>
          <span>{link.bandwidth_mbps || '1000'} Mbps</span>
          <span>{link.latency_ms || '0.5'} ms</span>
        </div>
      </div>
    </div>
  );
}

function InterfaceRow({ nodeId, link }) {
  const peer = otherSide(link, nodeId);
  const local = link.source.switch === nodeId ? link.source : link.destination;
  return (
    <div className="rounded-lg border p-3" style={{ backgroundColor: styles.panelSoft, borderColor: styles.mutedBorder }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>Port {local.port}</p>
          <p className="text-xs font-mono mt-1" style={{ color: COLORS.text.tertiary }}>Connected to {peer.switch}:{peer.port}</p>
        </div>
        <div className="text-right text-xs" style={{ color: COLORS.text.secondary }}>
          <p>{link.bandwidth_mbps || '1000'} Mbps</p>
          <p>{link.latency_ms || '0.5'} ms</p>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, source }) {
  return (
    <div className="rounded-lg border p-3" style={{ backgroundColor: styles.panelSoft, borderColor: styles.mutedBorder }}>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.text.tertiary }}>{label}</p>
      <p className="mt-2 text-lg font-bold" style={{ color: COLORS.accent.cyan }}>{value}</p>
      <p className="mt-1 text-[11px]" style={{ color: COLORS.text.tertiary }}>{source}</p>
    </div>
  );
}

function SourceTile({ title, source, detail }) {
  return (
    <div className="rounded-lg border p-4" style={{ backgroundColor: styles.panelSoft, borderColor: styles.mutedBorder }}>
      <p className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>{title}</p>
      <p className="mt-2 text-xs font-mono" style={{ color: COLORS.accent.cyan }}>{source}</p>
      <p className="mt-2 text-xs" style={{ color: COLORS.text.secondary }}>{detail}</p>
    </div>
  );
}
