import React from "react";
import { Search, Bell, Activity, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const TopBar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search */}
      <div className="flex items-center gap-3 w-72 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 focus-within:border-cyan-500/50 transition">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search water sources, villages..."
          className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* System Operational Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Activity className="w-3.5 h-3.5" />
          SYSTEM OPERATIONAL
        </div>

        {/* Notifications Bell */}
        <button className="relative p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        {/* User Role Dropdown */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="text-right hidden md:block">
            <span className="block text-xs font-bold text-slate-200">{user?.name}</span>
            <span className="block text-[10px] text-cyan-400 font-mono font-bold uppercase">{user?.role}</span>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
