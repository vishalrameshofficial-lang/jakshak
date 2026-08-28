import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAsPreset, isLoading } = useAuth();
  const [email, setEmail] = useState<string>("operator@jalrakshak.in");
  const [password, setPassword] = useState<string>("sih2026demo");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setErrorMsg("Invalid credentials. Try demo presets below.");
    }
  };

  const handlePreset = async (role: Role) => {
    await loginAsPreset(role);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex items-center justify-center p-6 selection:bg-cyan-500 selection:text-white">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-cyan-500/20">
            J
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">JAL-RAKSHAK</h2>
          <p className="text-xs text-slate-400 font-mono">Smart Water Intelligence Platform Login</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address:</label>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus-within:border-cyan-500/50">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password:</label>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800 focus-within:border-cyan-500/50">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition flex items-center justify-center gap-2"
          >
            {isLoading ? "Authenticating..." : "Sign In to Platform"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Role Presets */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            SIH Quick Demo Login Presets:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePreset("OPERATOR")}
              className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-cyan-300 transition"
            >
              Operator
            </button>
            <button
              type="button"
              onClick={() => handlePreset("ADMIN")}
              className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-amber-300 transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handlePreset("VIEWER")}
              className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-bold text-emerald-300 transition"
            >
              Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
