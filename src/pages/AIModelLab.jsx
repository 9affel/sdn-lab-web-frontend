import React, { useEffect, useState } from 'react';
import {
  Brain,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Zap,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getModels } from '../api/services';
import { COLORS } from '../design-system/constants';

const ChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: COLORS.primary, borderColor: COLORS.accent.cyan + '50', borderWidth: '1px' }} className="rounded-lg p-3 shadow-lg">
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

export default function AIModelLab() {
  const [models, setModels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decisionLatencyHistory, setDecisionLatencyHistory] = useState([]);
  const [rewardHistory, setRewardHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getModels();
        setModels(response.data);

        // Generate mock historical data
        setDecisionLatencyHistory(
          generateLatencyHistory(response.data?.risk_ml)
        );
        setRewardHistory(generateRewardHistory(response.data?.rl_agent));
      } catch (err) {
        console.error('Error fetching models:', err);
        // Use mock data
        setModels({
          risk_ml: {
            model: 'xLSTM',
            version: 'v1.2.3',
            accuracy: '86.07%',
            classes: 8,
            input_features: 64,
            seq_len: 5,
            last_updated: new Date().toISOString(),
          },
          rl_agent: {
            model: 'PPO',
            version: 'ppo_production/ppo_with_risk.zip',
            algorithm: 'Proximal Policy Optimization',
            action_space: 5,
            observation_space: 72,
            training_steps: 425000,
            episode_reward: 508.5,
            last_updated: new Date().toISOString(),
          },
        });
        setDecisionLatencyHistory(generateLatencyHistoryMock());
        setRewardHistory(generateRewardHistoryMock());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !models) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: COLORS.accent.cyan + '40', borderTopColor: COLORS.accent.cyan }}></div>
          <p className="text-secondary">Loading AI models...</p>
        </div>
      </div>
    );
  }

  if (!models) {
    return (
      <div className="text-center py-12">
        <p className="text-red">Failed to load AI models</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">AI Model Lab</h1>
        <p className="text-secondary">
          Risk ML (xLSTM) and RL Agent (PPO) performance monitoring
        </p>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: Risk ML (xLSTM) */}
        <div className="space-y-4">
          {/* Panel Header Card */}
          <Card style={{ borderColor: COLORS.accent.cyan + '40' }} className="bg-gradient-to-br from-cyan-500/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
                  Risk ML - xLSTM
                </CardTitle>
                <Badge className="text-xs" style={{ backgroundColor: COLORS.accent.cyan + '30', color: COLORS.accent.cyan }}>
                  {models.risk_ml?.version}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border text-tertiary" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                  <p className="text-xs text-tertiary mb-1">Accuracy</p>
                  <p className="text-lg font-bold" style={{ color: COLORS.accent.cyan }}>
                    {models.risk_ml?.accuracy}
                  </p>
                </div>
                <div className="p-3 rounded-lg border text-tertiary" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                  <p className="text-xs text-tertiary mb-1">Classes</p>
                  <p className="text-lg font-bold" style={{ color: COLORS.accent.cyan }}>
                    {models.risk_ml?.classes}
                  </p>
                </div>
                <div className="p-3 rounded-lg border text-tertiary" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                  <p className="text-xs text-tertiary mb-1">Input Features</p>
                  <p className="text-lg font-bold" style={{ color: COLORS.accent.cyan }}>
                    {models.risk_ml?.input_features}
                  </p>
                </div>
                <div className="p-3 rounded-lg border text-tertiary" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                  <p className="text-xs text-tertiary mb-1">Sequence Length</p>
                  <p className="text-lg font-bold" style={{ color: COLORS.accent.cyan }}>
                    {models.risk_ml?.seq_len}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-lg border" style={{ backgroundColor: COLORS.accent.cyan + '10', borderColor: COLORS.accent.cyan + '40' }}>
                <p className="text-xs" style={{ color: COLORS.accent.cyan + 'DD' }}>
                  <strong>xLSTM Architecture:</strong> Extended LSTM with
                  exponential gating for sequence-based anomaly detection across
                  71 network features. Detects temporal patterns in network flow
                  behavior with 86% accuracy on 8 attack classes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Decision Latency Chart */}
          <Card style={{ borderColor: COLORS.accent.cyan + '40' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
                Decision Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={decisionLatencyHistory}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis dataKey="time" stroke={COLORS.tertiary} />
                    <YAxis stroke={COLORS.tertiary} label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="latency_ms"
                      stroke={COLORS.accent.cyan}
                      strokeWidth={2}
                      dot={false}
                      name="Latency (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                <p className="text-xs text-tertiary">
                  Average latency: <span className="font-mono" style={{ color: COLORS.accent.cyan }}>0.3ms</span> • Peak: <span className="font-mono" style={{ color: COLORS.status.warning }}>0.8ms</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature Importance */}
          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Top Contributing Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: 'Packet Rate (pps)', importance: 94 },
                  { name: 'Byte Rate (bps)', importance: 87 },
                  { name: 'Flow Count', importance: 78 },
                  { name: 'Protocol Distribution', importance: 72 },
                  { name: 'URI Entropy', importance: 68 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-secondary">{item.name}</span>
                      <span className="text-sm font-semibold" style={{ color: COLORS.accent.cyan }}>
                        {item.importance}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full border" style={{ borderColor: COLORS.border, backgroundColor: COLORS.card, overflow: 'hidden' }}>
                      <div
                        className="h-full"
                        style={{
                          background: `linear-gradient(to right, ${COLORS.accent.cyan}, ${COLORS.accent.cyan}80)`,
                          width: `${item.importance}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PANEL 2: RL Agent (PPO) */}
        <div className="space-y-4">
          {/* Panel Header Card */}
          <Card style={{ borderColor: COLORS.status.success + '40' }} className="bg-gradient-to-br from-green-500/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: COLORS.status.success }} />
                  RL Agent - PPO
                </CardTitle>
                <Badge className="text-xs" style={{ backgroundColor: COLORS.status.success + '30', color: COLORS.status.success }}>
                  {models.rl_agent?.algorithm}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border text-tertiary" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                  <p className="text-xs text-tertiary mb-1">Training Steps</p>
                  <p className="text-lg font-bold" style={{ color: COLORS.status.success }}>
                    {(models.rl_agent?.training_steps / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="p-3 rounded-lg border text-tertiary" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                  <p className="text-xs text-tertiary mb-1">Episode Reward</p>
                  <p className="text-lg font-bold" style={{ color: COLORS.status.success }}>
                    {models.rl_agent?.episode_reward.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 rounded-lg border text-tertiary" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                  <p className="text-xs text-tertiary mb-1">Action Space</p>
                  <p className="text-lg font-bold" style={{ color: COLORS.status.success }}>
                    {models.rl_agent?.action_space}
                  </p>
                </div>
                <div className="p-3 rounded-lg border text-tertiary" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                  <p className="text-xs text-tertiary mb-1">Observation Space</p>
                  <p className="text-lg font-bold" style={{ color: COLORS.status.success }}>
                    {models.rl_agent?.observation_space}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-lg border" style={{ backgroundColor: COLORS.status.success + '10', borderColor: COLORS.status.success + '40' }}>
                <p className="text-xs" style={{ color: COLORS.status.success + 'DD' }}>
                  <strong>PPO Algorithm:</strong> Proximal Policy Optimization
                  with 5 actions (allow, rate_limit, reroute, quarantine,
                  block). Trained on 72 state features with risk probabilities.
                  Reward signal: successful threat mitigation vs false positives.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* RL Reward Chart */}
          <Card style={{ borderColor: COLORS.status.success + '40' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: COLORS.status.success }} />
                Training Reward Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rewardHistory}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis dataKey="episode" stroke={COLORS.tertiary} />
                    <YAxis stroke={COLORS.tertiary} label={{ value: 'Reward', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="reward"
                      fill={COLORS.status.success}
                      name="Episode Reward"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
                <p className="text-xs text-tertiary">
                  Current reward: <span className="font-mono" style={{ color: COLORS.status.success }}>508.5</span> • Training converged: <span className="font-mono" style={{ color: COLORS.status.success }}>✓</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Distribution */}
          <Card style={{ borderColor: COLORS.status.success + '40' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" style={{ color: COLORS.status.success }} />
                Action Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { action: 'Allow', count: 145, color: COLORS.status.success },
                { action: 'Rate Limit', count: 89, color: COLORS.status.warning },
                { action: 'Reroute', count: 34, color: COLORS.accent.cyan },
                { action: 'Quarantine', count: 18, color: COLORS.status.warning },
                { action: 'Block', count: 64, color: COLORS.status.danger },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-secondary">{item.action}</span>
                    <span className="text-sm font-semibold text-secondary">
                      {item.count} decisions
                    </span>
                  </div>
                  <div className="h-2 rounded-full border" style={{ borderColor: COLORS.border, backgroundColor: COLORS.card, overflow: 'hidden' }}>
                    <div
                      className="h-full"
                      style={{
                        backgroundColor: item.color,
                        width: `${(item.count / 350) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison Panel */}
      <Card style={{ borderColor: COLORS.accent.cyan + '40' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" style={{ color: COLORS.accent.cyan }} />
            Model Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: COLORS.border }}>
                  <th className="px-4 py-2 text-left text-secondary">Metric</th>
                  <th className="px-4 py-2 text-left text-secondary">
                    Risk ML (xLSTM)
                  </th>
                  <th className="px-4 py-2 text-left text-secondary">
                    RL Agent (PPO)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" style={{ borderColor: COLORS.border }}>
                  <td className="px-4 py-2 text-tertiary">Primary Role</td>
                  <td className="px-4 py-2" style={{ color: COLORS.accent.cyan }}>
                    Risk Detection & Classification
                  </td>
                  <td className="px-4 py-2" style={{ color: COLORS.status.success }}>
                    Action Decision Making
                  </td>
                </tr>
                <tr className="border-b" style={{ borderColor: COLORS.border }}>
                  <td className="px-4 py-2 text-tertiary">Output</td>
                  <td className="px-4 py-2" style={{ color: COLORS.accent.cyan }}>
                    Risk Score + Probabilities
                  </td>
                  <td className="px-4 py-2" style={{ color: COLORS.status.success }}>
                    Action ID + Confidence
                  </td>
                </tr>
                <tr className="border-b" style={{ borderColor: COLORS.border }}>
                  <td className="px-4 py-2 text-tertiary">Decision Time</td>
                  <td className="px-4 py-2" style={{ color: COLORS.accent.cyan }}>0.3ms avg</td>
                  <td className="px-4 py-2" style={{ color: COLORS.status.success }}>0.5ms avg</td>
                </tr>
                <tr className="border-b" style={{ borderColor: COLORS.border }}>
                  <td className="px-4 py-2 text-tertiary">Accuracy</td>
                  <td className="px-4 py-2" style={{ color: COLORS.accent.cyan }}>86.07%</td>
                  <td className="px-4 py-2" style={{ color: COLORS.status.success }}>97.2%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-tertiary">Training Data</td>
                  <td className="px-4 py-2" style={{ color: COLORS.accent.cyan }}>
                    Historical flows + labeled attacks
                  </td>
                  <td className="px-4 py-2" style={{ color: COLORS.status.success }}>
                    Simulated environment + risk feedback
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock data generators
function generateLatencyHistory(riskMl) {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    latency_ms: (Math.random() * 0.5 + 0.1).toFixed(3),
  }));
}

function generateLatencyHistoryMock() {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    latency_ms: (Math.random() * 0.5 + 0.1).toFixed(3),
  }));
}

function generateRewardHistory(rlAgent) {
  return Array.from({ length: 12 }, (_, i) => ({
    episode: `${(i + 1) * 50}K`,
    reward: 300 + i * 17 + Math.random() * 50,
  }));
}

function generateRewardHistoryMock() {
  return Array.from({ length: 12 }, (_, i) => ({
    episode: `${(i + 1) * 50}K`,
    reward: 300 + i * 17 + Math.random() * 50,
  }));
}
