import React from "react";
import { Search, Bell, User } from "lucide-react";
import { Badge } from "../ui/index";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-card/50 backdrop-blur-xl border-b border-border-light">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left: Search Bar */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center px-4 py-2 rounded-lg bg-primary border border-border-light hover:border-cyan/50 transition-colors group">
            <Search className="w-4 h-4 text-muted group-hover:text-cyan transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="ml-3 bg-transparent text-sm text-white placeholder-muted outline-none w-full"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-hover transition-colors group">
            <Bell className="w-5 h-5 text-secondary group-hover:text-cyan transition-colors" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red rounded-full animate-pulse"></span>
          </button>

          {/* User Profile */}
          <button className="p-2 rounded-lg hover:bg-hover transition-colors">
            <User className="w-5 h-5 text-secondary hover:text-cyan transition-colors" />
          </button>

          {/* Status Badge */}
          <Badge variant="green" className="ml-2">
            <span className="w-2 h-2 bg-green rounded-full animate-pulse mr-2"></span>
            Live
          </Badge>
        </div>
      </div>
    </header>
  );
}