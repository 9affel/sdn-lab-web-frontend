import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { COLORS, withAlpha } from '../../design-system/constants';

const SEV_STYLE = {
  critical: { color: COLORS.status.danger,  icon: ShieldAlert, label: 'CRITICAL' },
  high:     { color: COLORS.status.warning, icon: AlertTriangle, label: 'HIGH'    },
};

function NotificationDropdown({ notifications, unreadCount, markAllRead, dismiss, onClose }) {
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref}
      className="absolute right-0 top-full mt-2 w-96 z-50 rounded-xl overflow-hidden shadow-2xl border animate-scale-in"
      style={{ backgroundColor: COLORS.background.card, borderColor: withAlpha(COLORS.accent.cyan, '25') }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: withAlpha(COLORS.accent.cyan, '15') }}>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" style={{ color: COLORS.accent.cyan }} />
          <span className="text-[11px] font-black uppercase tracking-widest text-white">Security Alerts</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black"
              style={{ backgroundColor: withAlpha(COLORS.status.danger, '20'), color: COLORS.status.danger }}>
              {unreadCount} NEW
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="text-[9px] font-black uppercase tracking-widest transition-colors"
              style={{ color: COLORS.accent.cyan }}>
              Mark all read
            </button>
          )}
          <button onClick={onClose} style={{ color: COLORS.text.tertiary }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-3">
            <Bell className="w-8 h-8 opacity-10" style={{ color: COLORS.accent.cyan }} />
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.text.tertiary }}>
              No alerts yet
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const s  = SEV_STYLE[n.severity] || SEV_STYLE.high;
            const Ic = s.icon;
            return (
              <div key={n.id}
                className="flex items-start gap-3 px-4 py-3 border-b transition-colors hover:bg-zinc-800/30"
                style={{ borderColor: withAlpha(COLORS.text.tertiary, '08') }}>
                <div className="mt-0.5 p-1.5 rounded-md flex-shrink-0"
                  style={{ backgroundColor: withAlpha(s.color, '12') }}>
                  <Ic className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: s.color }}>
                      {n.title}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono leading-relaxed" style={{ color: COLORS.text.secondary }}>
                    {n.body}
                  </p>
                  <p className="text-[9px] mt-1" style={{ color: COLORS.text.tertiary }}>
                    {n.ts?.toLocaleTimeString()}
                  </p>
                </div>
                <button onClick={() => dismiss(n.id)} className="flex-shrink-0 mt-0.5"
                  style={{ color: COLORS.text.tertiary }}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t text-center"
          style={{ borderColor: withAlpha(COLORS.text.tertiary, '08') }}>
          <a href="/threats"
            className="text-[10px] font-black uppercase tracking-widest transition-colors"
            style={{ color: COLORS.accent.cyan }}>
            View All Threat Logs →
          </a>
        </div>
      )}
    </div>
  );
}

export default function TopBar() {
  const { notifications, unreadCount, markAllRead, dismiss } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) markAllRead();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b"
      style={{ backgroundColor: '#09090b', borderColor: withAlpha(COLORS.accent.cyan, '1A') }}>
      <div className="flex items-center justify-between px-8 py-4">

        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center px-4 py-2 rounded-lg border transition-colors group"
            style={{ backgroundColor: COLORS.background.primary, borderColor: withAlpha(COLORS.text.primary, '08') }}>
            <Search className="w-4 h-4 transition-colors" style={{ color: COLORS.text.tertiary }} />
            <input type="text" placeholder="Search..."
              className="ml-3 bg-transparent text-sm outline-none w-full"
              style={{ color: COLORS.text.primary }}/>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-5 ml-auto">

          {/* Bell with badge */}
          <div className="relative">
            <button onClick={handleOpen}
              className="relative p-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: open ? withAlpha(COLORS.accent.cyan, '10') : 'transparent' }}
              title="Notifications">
              <Bell className="w-5 h-5 transition-colors"
                style={{ color: open ? COLORS.accent.cyan : COLORS.text.secondary }} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-black px-0.5"
                  style={{ backgroundColor: COLORS.status.danger, color: '#fff',
                           boxShadow: `0 0 8px ${COLORS.status.danger}80` }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                markAllRead={markAllRead}
                dismiss={dismiss}
                onClose={() => setOpen(false)}
              />
            )}
          </div>

          {/* User */}
          <button className="p-2 rounded-lg transition-colors"
            style={{ color: COLORS.text.secondary }}>
            <User className="w-5 h-5" />
          </button>

          {/* Live badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest"
            style={{ backgroundColor: withAlpha(COLORS.status.success, '08'),
                     borderColor: withAlpha(COLORS.status.success, '20'),
                     color: COLORS.status.success }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: COLORS.status.success }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ backgroundColor: COLORS.status.success }} />
            </span>
            Live
          </div>
        </div>
      </div>
    </header>
  );
}