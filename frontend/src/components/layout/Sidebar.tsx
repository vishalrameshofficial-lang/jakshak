import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Droplet,
  Sliders,
  AlertTriangle,
  MapPin,
  BarChart3,
  Filter,
  FileCheck2,
  Cpu,
  Settings,
  ShieldAlert,
  Award
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDemo } from "../../context/DemoContext";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isLiveMode, setPresentationModeActive } = useDemo();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/monitoring", label: "Live Monitoring", icon: Activity },
    { to: "/sources", label: "Water Sources", icon: Droplet },
    { to: "/treatment", label: "Treatment", icon: Sliders },
    { to: "/alerts", label: "Alerts", icon: AlertTriangle },
    { to: "/map", label: "Risk Map", icon: MapPin },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/filters", label: "Filters", icon: Filter },
    { to: "/lab-verification", label: "Lab Verification", icon: FileCheck2 },
    { to: "/devices", label: "Devices", icon: Cpu },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/admin", label: "Admin", icon: ShieldAlert }
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
            J
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide text-white flex items-center gap-1.5">
              JAL-RAKSHAK
            </h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-tight">Smart Water Intelligence</p>
          </div>
        </div>

        {/* Presentation Launch Button */}
        <button
          onClick={() => setPresentationModeActive(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-amber-600/20"
        >
          <Award className="w-4 h-4" />
          LAUNCH SIH DEMO MODE
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer User & System Status */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40 space-y-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Telemetry Mode:</span>
          <span className="font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            {isLiveMode ? "DEMO SIMULATOR" : "REAL ESP32"}
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-slate-900">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
            {user?.name ? user.name[0] : "U"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-slate-200 truncate">{user?.name || "Operator"}</p>
            <p className="text-[10px] text-slate-400 font-mono uppercase">{user?.role || "OPERATOR"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
