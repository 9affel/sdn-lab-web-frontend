import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield, Bell, Database, Globe, Save, RefreshCw, CheckCircle,
  AlertTriangle, ToggleLeft, ToggleRight, Sliders, Lock, Clock,
  Cpu, User, ChevronRight, Mail, Send, Plus, Trash2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getSettings, updateSecurityPolicy, updateDataRetention } from '../api/services';
import { COLORS, withAlpha } from '../design-system/constants';
import api from '../api/axios';

// Notification API helpers (inline — no extra service file needed)
const getNotifSettings  = () => api.get('/api/v1/notifications');
const saveNotifSettings = (s) => api.put('/api/v1/notifications', s);
const testEmail         = (config) => api.post('/api/v1/notifications/test-email', { config });


// ── Shared primitives ─────────────────────────────────────────────────────────
function Toggle({ value, onChange, color = COLORS.accent.cyan }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="transition-all duration-200">
      {value
        ? <ToggleRight className="w-8 h-8" style={{ color }} />
        : <ToggleLeft  className="w-8 h-8" style={{ color: COLORS.text.tertiary }} />}
    </button>
  );
}

function RangeSlider({ value, min, max, step = 0.01, onChange, format, color = COLORS.accent.cyan }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.text.tertiary }}>{min}</span>
        <span className="text-sm font-black" style={{ color }}>{format ? format(value) : value}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.text.tertiary }}>{max}</span>
      </div>
      <div className="relative h-2 rounded-full" style={{ backgroundColor: withAlpha(COLORS.text.primary, '10') }}>
        <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-200"
          style={{ width: `${pct}%`, backgroundColor: color }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
      </div>
    </div>
  );
}

const ACTION_META = {
  allow:      { label: 'Allow',      color: COLORS.status.success },
  rate_limit: { label: 'Rate Limit', color: COLORS.status.warning },
  reroute:    { label: 'Reroute',    color: COLORS.accent.cyan    },
  quarantine: { label: 'Quarantine', color: COLORS.status.warning },
  block:      { label: 'Block',      color: COLORS.status.danger  },
};

function ActionPill({ action, enabled, onToggle }) {
  const meta = ACTION_META[action] || { label: action, color: COLORS.text.tertiary };
  return (
    <button type="button" onClick={() => onToggle(action)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-black uppercase tracking-widest transition-all duration-200"
      style={{
        borderColor: enabled ? withAlpha(meta.color, '50') : withAlpha(COLORS.text.tertiary, '20'),
        backgroundColor: enabled ? withAlpha(meta.color, '10') : 'transparent',
        color: enabled ? meta.color : COLORS.text.tertiary,
      }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: enabled ? meta.color : COLORS.text.tertiary }} />
      {meta.label}
    </button>
  );
}

function PillBtn({ label, active, onClick, color }) {
  return (
    <button type="button" onClick={onClick}
      className="px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest transition-all duration-150"
      style={{
        borderColor: active ? withAlpha(color, '50') : withAlpha(COLORS.text.tertiary, '20'),
        backgroundColor: active ? withAlpha(color, '12') : 'transparent',
        color: active ? color : COLORS.text.tertiary,
      }}>
      {label}
    </button>
  );
}

function RowToggle({ label, desc, value, onChange, color }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border"
      style={{ borderColor: withAlpha(color, '20'), backgroundColor: withAlpha(COLORS.background.input, '40') }}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>{label}</p>
        <p className="text-[9px] mt-0.5" style={{ color: COLORS.text.tertiary }}>{desc}</p>
      </div>
      <Toggle value={value} onChange={onChange} color={color} />
    </div>
  );
}

// ── Sub-pages ─────────────────────────────────────────────────────────────────
function SecurityPolicyPanel({ security, patch, dirty }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-white uppercase tracking-tighter">Security Policy Engine</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: COLORS.text.tertiary }}>
          Configure AI mitigation thresholds and RL agent permissions
        </p>
      </div>

      {/* Risk Threshold */}
      <div className="p-4 rounded-lg border space-y-3"
        style={{ borderColor: withAlpha(COLORS.accent.cyan, '20'), backgroundColor: withAlpha(COLORS.background.input, '60') }}>
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5" style={{ color: COLORS.accent.cyan }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>Risk Score Threshold</p>
        </div>
        <RangeSlider value={security.risk_threshold} min={0} max={1} step={0.01}
          onChange={v => patch({ risk_threshold: v })}
          format={v => `${(v * 100).toFixed(0)}%`}
          color={security.risk_threshold > 0.7 ? COLORS.status.danger : COLORS.accent.cyan} />
        <p className="text-[9px]" style={{ color: COLORS.text.tertiary }}>Flows with AI risk score above this value trigger mitigation.</p>
      </div>

      {/* PPS Threshold */}
      <div className="p-4 rounded-lg border space-y-3"
        style={{ borderColor: withAlpha(COLORS.status.warning, '20'), backgroundColor: withAlpha(COLORS.background.input, '60') }}>
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5" style={{ color: COLORS.status.warning }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>PPS Alert Threshold</p>
        </div>
        <RangeSlider value={security.pps_threshold} min={100} max={1000000} step={100}
          onChange={v => patch({ pps_threshold: v })}
          format={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K pps` : `${v} pps`}
          color={COLORS.status.warning} />
        <p className="text-[9px]" style={{ color: COLORS.text.tertiary }}>Packets per second ceiling before a HIGH alert fires.</p>
      </div>

      {/* Block Duration */}
      <div className="p-4 rounded-lg border space-y-3"
        style={{ borderColor: withAlpha(COLORS.status.danger, '20'), backgroundColor: withAlpha(COLORS.background.input, '60') }}>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" style={{ color: COLORS.status.danger }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>OVS Block Rule TTL</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[30, 60, 120, 300, 600, 1800, 3600].map(s => (
            <PillBtn key={s} label={s < 60 ? `${s}s` : `${s / 60}m`}
              active={security.block_duration_seconds === s}
              onClick={() => patch({ block_duration_seconds: s })}
              color={COLORS.status.danger} />
          ))}
        </div>
        <p className="text-[9px]" style={{ color: COLORS.text.tertiary }}>Duration OVS drop rules stay active before auto-expiring.</p>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <RowToggle label="Auto-Block Enabled" desc="RL agent installs OVS drop rules automatically"
          value={security.auto_block_enabled} onChange={v => patch({ auto_block_enabled: v })} color={COLORS.accent.cyan} />
        <RowToggle label="Quarantine Mode" desc="Isolate suspect flows in a sandboxed VLAN"
          value={security.quarantine_enabled} onChange={v => patch({ quarantine_enabled: v })} color={COLORS.status.warning} />
        <RowToggle label="Severity Auto-Escalate" desc="Escalate severity when PPS threshold is exceeded"
          value={security.severity_auto_escalate} onChange={v => patch({ severity_auto_escalate: v })} color={COLORS.status.danger} />
      </div>

      {/* Permitted Actions */}
      <div className="p-4 rounded-lg border space-y-3"
        style={{ borderColor: withAlpha(COLORS.accent.cyan, '20'), backgroundColor: withAlpha(COLORS.background.input, '40') }}>
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" style={{ color: COLORS.accent.cyan }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>Permitted RL Actions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(ACTION_META).map(action => (
            <ActionPill key={action} action={action}
              enabled={security.enabled_actions.includes(action)}
              onToggle={a => {
                const has = security.enabled_actions.includes(a);
                patch({ enabled_actions: has ? security.enabled_actions.filter(x => x !== a) : [...security.enabled_actions, a] });
              }} />
          ))}
        </div>
        <p className="text-[9px]" style={{ color: COLORS.text.tertiary }}>Only enabled actions may be selected by the PPO agent at inference time.</p>
      </div>
    </div>
  );
}

function DataRetentionPanel({ retention, patch }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-white uppercase tracking-tighter">Data Retention</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: COLORS.text.tertiary }}>
          Log storage duration and MongoDB archival policies
        </p>
      </div>

      <div className="p-4 rounded-lg border space-y-3"
        style={{ borderColor: withAlpha(COLORS.status.warning, '20'), backgroundColor: withAlpha(COLORS.background.input, '60') }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>Attack Logs Retention</p>
        <RangeSlider value={retention.attack_logs_days} min={1} max={365} step={1}
          onChange={v => patch({ attack_logs_days: v })}
          format={v => `${v} days`} color={COLORS.status.warning} />
        <p className="text-[9px]" style={{ color: COLORS.text.tertiary }}>Attack event documents older than this are purged from MongoDB.</p>
      </div>

      <div className="p-4 rounded-lg border space-y-3"
        style={{ borderColor: withAlpha(COLORS.status.warning, '20'), backgroundColor: withAlpha(COLORS.background.input, '60') }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>Metrics History Window</p>
        <div className="flex gap-2 flex-wrap">
          {[24, 72, 168, 336, 720].map(h => (
            <PillBtn key={h} label={h < 48 ? `${h}h` : `${h / 24}d`}
              active={retention.metrics_history_hours === h}
              onClick={() => patch({ metrics_history_hours: h })}
              color={COLORS.status.warning} />
          ))}
        </div>
        <p className="text-[9px]" style={{ color: COLORS.text.tertiary }}>Window kept in the metrics_history collection for dashboard charts.</p>
      </div>

      <RowToggle label="Auto Cleanup" desc="Automatically purge expired records on a nightly schedule"
        value={retention.auto_cleanup_enabled} onChange={v => patch({ auto_cleanup_enabled: v })} color={COLORS.status.warning} />
    </div>
  );
}

function NetworkConfigPanel({ network }) {
  const rows = [
    { label: 'SDN Controller URL',   value: network.controller_url },
    { label: 'Ingest Endpoint',      value: network.ingest_endpoint },
    { label: 'Poll Interval',        value: `${network.backend_poll_interval_seconds}s` },
    { label: 'WebSocket Transport',  value: network.websocket_enabled ? 'Enabled' : 'Disabled' },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-white uppercase tracking-tighter">Network Configuration</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: COLORS.text.tertiary }}>
          SDN controller connection and API endpoint references
        </p>
      </div>
      <div className="p-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest"
        style={{ borderColor: withAlpha(COLORS.text.tertiary, '20'), backgroundColor: withAlpha(COLORS.text.tertiary, '05'), color: COLORS.text.tertiary }}>
        ⓘ  These values are configured via environment variables and container orchestration — read-only from the UI.
      </div>
      <div className="space-y-2">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between p-3 rounded border"
            style={{ borderColor: withAlpha(COLORS.text.tertiary, '12'), backgroundColor: withAlpha(COLORS.background.input, '30') }}>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.tertiary }}>{label}</span>
            <span className="font-mono text-[11px] font-bold" style={{ color: COLORS.text.secondary }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const [cfg, setCfg]           = useState({
    enabled: false, smtp_host: 'smtp.gmail.com', smtp_port: 587,
    smtp_user: '', smtp_password: '', from_address: '',
    to_addresses: [], use_tls: true,
    alert_on_critical: true, alert_on_high: false, min_interval_seconds: 60,
  });
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [status, setStatus]     = useState(null); // 'saved' | 'tested' | 'error'

  useEffect(() => {
    getNotifSettings().then(r => setCfg(prev => ({ ...prev, ...r.data.email }))).catch(() => {});
  }, []);

  const patch = (p) => setCfg(prev => ({ ...prev, ...p }));

  const addEmail = () => {
    const e = newEmail.trim();
    if (e && !cfg.to_addresses.includes(e)) {
      patch({ to_addresses: [...cfg.to_addresses, e] });
      setNewEmail('');
    }
  };

  const removeEmail = (e) => patch({ to_addresses: cfg.to_addresses.filter(x => x !== e) });

  const handleSave = async () => {
    setSaving(true); setStatus(null);
    try {
      await saveNotifSettings({ email: cfg });
      setStatus('saved');
    } catch { setStatus('error'); }
    finally { setSaving(false); setTimeout(() => setStatus(null), 3000); }
  };

  const handleTest = async () => {
    setTesting(true); setStatus(null);
    try {
      await testEmail(cfg);
      setStatus('tested');
    } catch { setStatus('error'); }
    finally { setTesting(false); setTimeout(() => setStatus(null), 4000); }
  };

  const F = ({ label, children }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.tertiary }}>{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full px-3 py-2 rounded-lg border bg-transparent text-sm font-mono outline-none focus:border-opacity-80 transition-colors";
  const inputStyle = { borderColor: withAlpha(COLORS.accent.cyan, '25'), color: COLORS.text.primary,
    backgroundColor: withAlpha(COLORS.background.input, '60') };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-white uppercase tracking-tighter">Notifications</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: COLORS.text.tertiary }}>
          Email alert delivery for critical attack events
        </p>
      </div>

      {/* Master toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border"
        style={{ borderColor: withAlpha(COLORS.accent.cyan, '25'), backgroundColor: withAlpha(COLORS.accent.cyan, '05') }}>
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4" style={{ color: COLORS.accent.cyan }} />
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-white">Email Notifications</p>
            <p className="text-[9px]" style={{ color: COLORS.text.tertiary }}>Send email alerts on critical/high severity attacks</p>
          </div>
        </div>
        <Toggle value={cfg.enabled} onChange={v => patch({ enabled: v })} color={COLORS.accent.cyan} />
      </div>

      {/* SMTP Config */}
      <div className="p-4 rounded-lg border space-y-4"
        style={{ borderColor: withAlpha(COLORS.text.tertiary, '12'), backgroundColor: withAlpha(COLORS.background.input, '40'),
          opacity: cfg.enabled ? 1 : 0.5, pointerEvents: cfg.enabled ? 'auto' : 'none' }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>SMTP Server</p>
        <div className="grid grid-cols-2 gap-3">
          <F label="SMTP Host">
            <input className={inputCls} style={inputStyle} value={cfg.smtp_host}
              onChange={e => patch({ smtp_host: e.target.value })} placeholder="smtp.gmail.com" />
          </F>
          <F label="Port">
            <input className={inputCls} style={inputStyle} type="number" value={cfg.smtp_port}
              onChange={e => patch({ smtp_port: Number(e.target.value) })} />
          </F>
          <F label="SMTP Username">
            <input className={inputCls} style={inputStyle} value={cfg.smtp_user}
              onChange={e => patch({ smtp_user: e.target.value })} placeholder="alerts@yourdomain.com" />
          </F>
          <F label="Password">
            <input className={inputCls} style={inputStyle} type="password" value={cfg.smtp_password}
              onChange={e => patch({ smtp_password: e.target.value })} placeholder="App password / token" />
          </F>
        </div>
        <F label="From Address (optional)">
          <input className={inputCls} style={inputStyle} value={cfg.from_address}
            onChange={e => patch({ from_address: e.target.value })} placeholder="SDN-EDR Alerts <noreply@yourdomain.com>" />
        </F>
        <div className="flex items-center gap-3 pt-1">
          <Toggle value={cfg.use_tls} onChange={v => patch({ use_tls: v })} color={COLORS.accent.cyan} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>STARTTLS</span>
        </div>
      </div>

      {/* Recipients */}
      <div className="p-4 rounded-lg border space-y-3"
        style={{ borderColor: withAlpha(COLORS.text.tertiary, '12'), backgroundColor: withAlpha(COLORS.background.input, '40'),
          opacity: cfg.enabled ? 1 : 0.5, pointerEvents: cfg.enabled ? 'auto' : 'none' }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>Recipients</p>
        <div className="flex gap-2">
          <input className={`${inputCls} flex-1`} style={inputStyle} value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEmail()}
            placeholder="admin@yourdomain.com" />
          <button onClick={addEmail}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all"
            style={{ borderColor: withAlpha(COLORS.accent.cyan, '40'), color: COLORS.accent.cyan,
              backgroundColor: withAlpha(COLORS.accent.cyan, '08') }}>
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        {cfg.to_addresses.length === 0 ? (
          <p className="text-[9px]" style={{ color: COLORS.text.tertiary }}>No recipients yet — add at least one email address.</p>
        ) : (
          <div className="space-y-1.5">
            {cfg.to_addresses.map(e => (
              <div key={e} className="flex items-center justify-between px-3 py-1.5 rounded border"
                style={{ borderColor: withAlpha(COLORS.accent.cyan, '15'), backgroundColor: withAlpha(COLORS.accent.cyan, '05') }}>
                <span className="font-mono text-[11px]" style={{ color: COLORS.text.secondary }}>{e}</span>
                <button onClick={() => removeEmail(e)} style={{ color: COLORS.status.danger }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert triggers */}
      <div className="space-y-2"
        style={{ opacity: cfg.enabled ? 1 : 0.5, pointerEvents: cfg.enabled ? 'auto' : 'none' }}>
        <div className="flex items-center justify-between p-3 rounded-lg border"
          style={{ borderColor: withAlpha(COLORS.status.danger, '20'), backgroundColor: withAlpha(COLORS.status.danger, '05') }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>Alert on CRITICAL</p>
            <p className="text-[9px]" style={{ color: COLORS.text.tertiary }}>Risk score ≥ 90%</p>
          </div>
          <Toggle value={cfg.alert_on_critical} onChange={v => patch({ alert_on_critical: v })} color={COLORS.status.danger} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border"
          style={{ borderColor: withAlpha(COLORS.status.warning, '20'), backgroundColor: withAlpha(COLORS.status.warning, '05') }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.secondary }}>Alert on HIGH</p>
            <p className="text-[9px]" style={{ color: COLORS.text.tertiary }}>Risk score 70–90%</p>
          </div>
          <Toggle value={cfg.alert_on_high} onChange={v => patch({ alert_on_high: v })} color={COLORS.status.warning} />
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleTest} disabled={testing || !cfg.smtp_host || !cfg.to_addresses.length}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: withAlpha(COLORS.text.secondary, '25'), color: COLORS.text.secondary }}>
          {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {testing ? 'Sending...' : 'Test Email'}
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40"
          style={{ backgroundColor: withAlpha(COLORS.accent.cyan, '12'), borderColor: withAlpha(COLORS.accent.cyan, '40'), color: COLORS.accent.cyan }}>
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Saving...' : 'Save Config'}
        </button>
        {status === 'saved'  && <span className="text-[10px] font-black uppercase" style={{ color: COLORS.status.success }}>✓ Saved</span>}
        {status === 'tested' && <span className="text-[10px] font-black uppercase" style={{ color: COLORS.status.success }}>✓ Test sent</span>}
        {status === 'error'  && <span className="text-[10px] font-black uppercase" style={{ color: COLORS.status.danger }}>✗ Failed</span>}
      </div>
    </div>
  );
}


function AccountPanel() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-white uppercase tracking-tighter">Account Settings</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: COLORS.text.tertiary }}>
          User profile, credentials, and access control
        </p>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Username',  value: 'admin' },
          { label: 'Role',      value: 'Super Admin' },
          { label: 'API Key',   value: '••••••••••••••••••••' },
          { label: 'Last Login', value: new Date().toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between p-3 rounded border"
            style={{ borderColor: withAlpha(COLORS.text.tertiary, '12'), backgroundColor: withAlpha(COLORS.background.input, '30') }}>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.text.tertiary }}>{label}</span>
            <span className="font-mono text-[11px] font-bold" style={{ color: COLORS.text.secondary }}>{value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed"
        style={{ borderColor: withAlpha(COLORS.accent.cyan, '20') }}>
        <User className="w-8 h-8 mb-3 opacity-20" style={{ color: COLORS.accent.cyan }} />
        <p className="text-[10px]" style={{ color: COLORS.text.tertiary }}>Full account management coming in next release.</p>
      </div>
    </div>
  );
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'security',    label: 'Security Policy',       icon: Shield,   color: COLORS.accent.cyan    },
  { id: 'retention',   label: 'Data Retention',         icon: Database, color: COLORS.status.warning },
  { id: 'network',     label: 'Network Configuration',  icon: Globe,    color: COLORS.text.secondary },
  { id: 'notif',       label: 'Notifications',          icon: Bell,     color: COLORS.accent.cyan    },
  { id: 'account',     label: 'Account Settings',       icon: User,     color: COLORS.text.secondary },
];

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_SECURITY = {
  risk_threshold: 0.7, pps_threshold: 10000, block_duration_seconds: 300,
  auto_block_enabled: true, quarantine_enabled: true, severity_auto_escalate: true,
  enabled_actions: ['allow', 'rate_limit', 'reroute', 'quarantine', 'block'],
};
const DEFAULT_RETENTION = { attack_logs_days: 30, metrics_history_hours: 720, auto_cleanup_enabled: true };
const DEFAULT_NETWORK   = { controller_url: 'http://ryu:8080', backend_poll_interval_seconds: 5, websocket_enabled: true, ingest_endpoint: '/api/v1/ingest/telemetry' };

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const [active, setActive]       = useState('security');
  const [security, setSecurity]   = useState(DEFAULT_SECURITY);
  const [retention, setRetention] = useState(DEFAULT_RETENTION);
  const [network, setNetwork]     = useState(DEFAULT_NETWORK);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [dirty, setDirty]         = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await getSettings();
      const d = res.data;
      if (d.security)        setSecurity(s => ({ ...s, ...d.security }));
      if (d.data_retention)  setRetention(r => ({ ...r, ...d.data_retention }));
      if (d.network)         setNetwork(n => ({ ...n, ...d.network }));
    } catch (e) { console.warn('Settings fallback to defaults:', e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const patchSecurity  = p => { setSecurity(s => ({ ...s, ...p }));  setDirty(true); };
  const patchRetention = p => { setRetention(r => ({ ...r, ...p })); setDirty(true); };

  const handleSave = async () => {
    setSaving(true); setSaveStatus(null);
    try {
      await Promise.all([updateSecurityPolicy(security), updateDataRetention(retention)]);
      setSaveStatus('success'); setDirty(false);
    } catch { setSaveStatus('error'); }
    finally { setSaving(false); setTimeout(() => setSaveStatus(null), 3000); }
  };

  const showSave = active === 'security' || active === 'retention';

  return (
    <div className="flex gap-6 animate-fade-in min-h-[600px]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="w-56 flex-shrink-0">
        <div className="sticky top-6 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest px-3 mb-3"
            style={{ color: COLORS.text.tertiary }}>Configuration</p>
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} type="button" onClick={() => setActive(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all duration-200"
                style={{
                  borderColor: isActive ? withAlpha(item.color, '30') : 'transparent',
                  backgroundColor: isActive ? withAlpha(item.color, '08') : 'transparent',
                  color: isActive ? item.color : COLORS.text.tertiary,
                }}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-widest leading-tight">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" style={{ color: item.color }} />}
              </button>
            );
          })}

          {/* Save button in sidebar */}
          {showSave && (
            <div className="pt-4 border-t mt-4" style={{ borderColor: withAlpha(COLORS.text.tertiary, '10') }}>
              <button onClick={handleSave} disabled={saving || !dirty}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-[11px] font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: dirty ? withAlpha(COLORS.accent.cyan, '12') : 'transparent',
                  borderColor: dirty ? withAlpha(COLORS.accent.cyan, '40') : withAlpha(COLORS.accent.cyan, '15'),
                  color: COLORS.accent.cyan,
                }}>
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Applying...' : 'Apply'}
              </button>
              {saveStatus === 'success' && (
                <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded text-[10px] font-black uppercase"
                  style={{ color: COLORS.status.success, backgroundColor: withAlpha(COLORS.status.success, '08') }}>
                  <CheckCircle className="w-3 h-3" /> Saved
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded text-[10px] font-black uppercase"
                  style={{ color: COLORS.status.danger, backgroundColor: withAlpha(COLORS.status.danger, '08') }}>
                  <AlertTriangle className="w-3 h-3" /> Failed
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <Card style={{ borderColor: withAlpha(COLORS.accent.cyan, '20'), backgroundColor: COLORS.background.card }}
          className="overflow-hidden shadow-2xl">
          <div className="h-[2px] w-full"
            style={{ backgroundColor: NAV.find(n => n.id === active)?.color || COLORS.accent.cyan }} />
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-60">
                <div className="w-8 h-8 border-4 rounded-full animate-spin"
                  style={{ borderColor: withAlpha(COLORS.accent.cyan, '20'), borderTopColor: COLORS.accent.cyan }} />
              </div>
            ) : (
              <>
                {active === 'security'  && <SecurityPolicyPanel  security={security}  patch={patchSecurity}  dirty={dirty} />}
                {active === 'retention' && <DataRetentionPanel    retention={retention} patch={patchRetention} />}
                {active === 'network'   && <NetworkConfigPanel    network={network} />}
                {active === 'notif'     && <NotificationsPanel />}
                {active === 'account'   && <AccountPanel />}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
