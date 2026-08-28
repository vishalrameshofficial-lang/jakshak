import React, { useState, useEffect } from "react";
import { Cpu, Wifi, Battery, AlertOctagon, CheckCircle2 } from "lucide-react";
import api from "../services/api";

export const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);

  const fetchDevices = async () => {
    try {
      const res = await api.get("/devices");
      if (res.data.success) {
        setDevices(res.data.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            ESP32 IoT Hardware Nodes & Sensor Health Diagnostics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time hardware heartbeats, battery telemetry, signal RSSI, and sensor fault vs water anomaly diagnostic.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((dev) => (
          <div key={dev.id} className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-cyan-400">{dev.deviceCode}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                dev.status === "ONLINE" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              }`}>
                {dev.status}
              </span>
            </div>

            <p className="text-xs text-slate-300">Source: <strong className="text-white">{dev.source?.name} ({dev.source?.code})</strong></p>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>{dev.batteryLevel}% Battery</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span>{dev.signalStrength} dBm RSSI</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Attached Sensors:</span>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                {(dev.sensors || []).map((s: any) => (
                  <span key={s.id} className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {s.sensorType}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
