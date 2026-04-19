import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Network,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  TrendingUp,
  Eye,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Network Log", icon: Activity, path: "/threats" },
    { label: "Extension", icon: Shield, path: "/extension" },
    { label: "Risk Overlay", icon: Eye, path: "/network" },
    { label: "Risk Analysis", icon: TrendingUp, path: "/analysis" },
    { label: "Privacy Shield", icon: Shield, path: "/privacy" },
    { label: "Threat History", icon: Activity, path: "/history" },
    { label: "Breach Check", icon: Shield, path: "/breach" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border hover:border-cyan transition-colors"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-cyan" />
        ) : (
          <Menu className="w-5 h-5 text-cyan" />
        )}
      </button>

      {/* Sidebar - FIXED */}
      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-sidebar border-r border-border flex flex-col transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/Branding Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan/10 border-2 border-cyan flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-cyan" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                SDN-EDR
              </h1>
              <p className="text-xs text-text-secondary">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? "bg-cyan/10 text-cyan border-l-2 border-cyan"
                    : "text-text-secondary hover:text-cyan hover:bg-hover/50 border-l-2 border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  active ? "text-cyan" : "group-hover:text-cyan"
                }`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-shrink-0" />

        {/* System Status Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan animate-pulse flex-shrink-0" />
            <span className="text-xs font-medium text-text-secondary">System Online</span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-transparent border-2 border-red text-red hover:bg-red/10 transition-all duration-200 font-medium text-sm group">
            <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}