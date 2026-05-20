import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Network,
  Settings,

  Menu,
  X,
  Shield,
  Layers,
  Brain,
  Zap
} from "lucide-react";
import { COLORS, withAlpha } from "../../design-system/constants";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  
  const sidebarOutline = withAlpha(COLORS.accent.cyan, '1A');
  const sidebarDivider = withAlpha(COLORS.accent.cyan, '14');

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Threat Intel", icon: Activity, path: "/threats" },
    { label: "Network Map", icon: Network, path: "/network" },
    { label: "Flow Inspector", icon: Layers, path: "/flows" },
    { label: "AI Model Lab", icon: Brain, path: "/ai-lab" },
    { label: "Configuration", icon: Settings, path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition-colors"
        style={{ backgroundColor: COLORS.background.card, borderColor: withAlpha(COLORS.accent.cyan, '25') }}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-cyan-400" />
        ) : (
          <Menu className="w-5 h-5 text-cyan-400" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 border-r flex flex-col transition-all duration-300 z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: COLORS.background.sidebar,
          borderRightColor: sidebarOutline,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Branding Section */}
        <div className="px-6 py-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tighter text-white uppercase text-nowrap">SDN-EDR</h1>
                <div className="px-1 py-0.5 rounded-sm bg-cyan-500/20 border border-cyan-500/30">
                  <span className="text-[8px] font-black text-cyan-400">PRO</span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Enterprise Console</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-200 group ${
                  active
                    ? "bg-zinc-900 text-cyan-400 border-zinc-800 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]"
                    : "text-zinc-500 border-transparent hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
              >
                {active && (
                  <span className="absolute left-[-1px] top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" />
                )}
                <Icon className={`w-4.5 h-4.5 transition-colors ${
                  active ? "text-cyan-400" : "text-zinc-600 group-hover:text-zinc-300"
                }`} />
                <span className={`text-[13px] font-bold tracking-tight transition-colors ${
                  active ? "text-white" : "group-hover:text-zinc-200"
                }`}>{item.label}</span>
                
                {active && <Zap className="w-3 h-3 ml-auto text-cyan-500/50 animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* System Health */}
        <div className="p-4 mt-auto">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">System State</span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                </span>
                <span className="text-[10px] font-bold text-green-500 uppercase">Secure</span>
              </div>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 w-[78%] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            </div>
          </div>
        </div>


      </aside>
    </>
  );
}
