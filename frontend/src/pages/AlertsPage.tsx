import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Filter, Clock } from "lucide-react";
import api from "../services/api";

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/alerts");
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.post(`/alerts/${id}/acknowledge`, { userName: "Operator" });
      fetchAlerts();
    } catch (e) {}
  };

  const handleResolve = async (id: string) => {
    try {
      await api.post(`/alerts/${id}/resolve`, { userName: "Operator" });
      fetchAlerts();
    } catch (e) {}
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Smart Priority Alert Center ({alerts.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized contamination warnings, multi-parameter anomalies, and filter maintenance notifications.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                alert.severity === "CRITICAL" ? "bg-rose-500/10 border border-rose-500/30 text-rose-400" :
                alert.severity === "WARNING" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" :
                "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
              }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{alert.title}</span>
                  <span className="font-mono text-[10px] font-bold bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                    Priority {alert.priorityScore}/100
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    alert.status === "ACTIVE" ? "bg-rose-500/20 text-rose-300" :
                    alert.status === "ACKNOWLEDGED" ? "bg-amber-500/20 text-amber-300" :
                    "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {alert.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 max-w-2xl">{alert.message}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Source: <strong className="text-slate-200">{alert.source?.name} ({alert.source?.code})</strong> • Timestamp: {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              {alert.status === "ACTIVE" && (
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition"
                >
                  Acknowledge
                </button>
              )}
              {alert.status !== "RESOLVED" && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition"
                >
                  Resolve Alert
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
