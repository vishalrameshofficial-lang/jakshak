import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Activity, Cpu, Sliders, MapPin, Award, ArrowRight, Zap, RefreshCw } from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Header Nav */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-800/80 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-cyan-500/20">
            J
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-wide">JAL-RAKSHAK</span>
            <span className="block text-[10px] text-cyan-400 font-mono tracking-wider uppercase">Smart Water Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white transition px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/dashboard"
            className="text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto text-center space-y-8 flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wide">
          <Award className="w-4 h-4" />
          SMART INDIA HACKATHON 2026 PROTOTYPE
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Know Your Water Before It Becomes a <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Risk</span>.
        </h1>

        <p className="text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
          JAL-RAKSHAK combines real-time sensing, statistical fingerprinting, adaptive purification matrix control, contamination early-warning, and closed-loop post-treatment verification for rural & mining-affected regions.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl shadow-xl shadow-cyan-600/25 transition flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Open Command Center
          </Link>

          <Link
            to="/map"
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-bold rounded-xl transition flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            Explore Regional Risk Map
          </Link>
        </div>

        {/* Architecture Cycle Diagram */}
        <div className="w-full mt-16 pt-12 border-t border-slate-800/80">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-6">
            End-to-End Intelligence Cycle
          </span>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {[
              { title: "SENSE", icon: Cpu, desc: "IoT sensor telemetry ingestion" },
              { title: "FINGERPRINT", icon: Activity, desc: "Statistical baseline learning" },
              { title: "DETECT", icon: Zap, desc: "Multi-parameter anomaly flags" },
              { title: "PREDICT", icon: ShieldCheck, desc: "0-100 Water Risk Score" },
              { title: "DECIDE", icon: Sliders, desc: "Minimum treatment matrix" },
              { title: "PURIFY", icon: RefreshCw, desc: "Purification & WRR recovery" },
              { title: "VERIFY", icon: Award, desc: "Closed-loop post check & lab learn" }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition">
                  <Icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-white">{step.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        JAL-RAKSHAK Smart Water Intelligence Platform &copy; 2026. Designed for SIH Smart Water Purification & Quality Monitoring.
      </footer>
    </div>
  );
};
