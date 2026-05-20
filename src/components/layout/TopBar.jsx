import React from 'react';
import { Search, User, Sun, Moon } from 'lucide-react';
import { COLORS, withAlpha } from '../../design-system/constants';
import { useTheme } from '../../design-system/theme';

function ThemeToggle() {
  const { theme, isLight, toggleTheme } = useTheme();
  const Icon = isLight ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:scale-[1.02]"
      style={{
        backgroundColor: withAlpha(COLORS.accent.cyan, isLight ? '0F' : '12'),
        borderColor: withAlpha(COLORS.accent.cyan, '35'),
        color: COLORS.accent.cyan,
      }}
      title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
    >
      <Icon className="h-4 w-4" />
      <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
}

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b"
      style={{ backgroundColor: COLORS.background.sidebar, borderColor: withAlpha(COLORS.accent.cyan, '1A') }}>
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
          <ThemeToggle />

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
