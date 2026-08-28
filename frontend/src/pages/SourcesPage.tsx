import React, { useState } from "react";
import { useDemo } from "../context/DemoContext";
import { StatusBadge } from "../components/common/StatusBadge";
import { Link } from "react-router-dom";
import { Droplet, MapPin, Search, Filter } from "lucide-react";

export const SourcesPage: React.FC = () => {
  const { sources } = useDemo();
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSources = sources.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === "MINING") return matchesSearch && s.isMiningAffected;
    if (filterType === "SAFE") return matchesSearch && s.status === "SAFE";
    if (filterType === "CRITICAL") return matchesSearch && s.status === "CRITICAL";
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Droplet className="w-6 h-6 text-cyan-400" />
            Water Sources Directory ({filteredSources.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered groundwater borewells, community tanks, and mining-zone water supply nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search source or village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 text-xs font-bold text-slate-300 px-3 py-2 rounded-xl border border-slate-800"
          >
            <option value="ALL">All Sources</option>
            <option value="MINING">Mining Affected Only</option>
            <option value="SAFE">Safe Status Only</option>
            <option value="CRITICAL">Critical Status Only</option>
          </select>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSources.map((source) => (
          <div key={source.id} className="glass-panel glass-panel-hover p-6 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400">{source.code}</span>
                <StatusBadge status={source.status} />
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{source.name}</h3>

              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <p className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {source.village}, {source.district}
                </p>
                <p>Type: <strong className="text-slate-200">{source.type}</strong></p>
                <p>Mining Zone: <strong className={source.isMiningAffected ? "text-amber-400" : "text-emerald-400"}>{source.isMiningAffected ? "Mining Affected Zone" : "Standard Zone"}</strong></p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Risk Score:</span>
                <span className="text-lg font-mono font-extrabold text-amber-400">{source.currentRiskScore} / 100</span>
              </div>

              <Link
                to={`/sources/${source.id}`}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg transition"
              >
                View Details &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
