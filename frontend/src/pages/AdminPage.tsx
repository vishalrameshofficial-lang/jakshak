import React, { useState, useEffect } from "react";
import { ShieldAlert, FileText, UserCheck } from "lucide-react";
import api from "../services/api";

export const AdminPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/admin/audit-logs");
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (e) {}
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            Admin Panel & System Security Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable audit logs for critical actions (treatment override, emergency stop, threshold change, lab verification).
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          Recent System Security Audit Trail
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-cyan-300">{log.userName}</td>
                  <td className="p-3 font-bold text-amber-400">{log.action}</td>
                  <td className="p-3 text-slate-300">{log.target}</td>
                  <td className="p-3 text-slate-400">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
