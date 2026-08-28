import React from "react";
import { SourceStatus } from "../../types";

interface StatusBadgeProps {
  status: SourceStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const upper = status.toUpperCase();

  let styles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let dot = "bg-emerald-400";

  if (upper === "WATCH") {
    styles = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    dot = "bg-amber-400";
  } else if (upper === "WARNING") {
    styles = "bg-orange-500/10 text-orange-400 border-orange-500/30";
    dot = "bg-orange-400";
  } else if (upper === "CRITICAL") {
    styles = "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse";
    dot = "bg-rose-400";
  } else if (upper === "OFFLINE") {
    styles = "bg-slate-700/30 text-slate-400 border-slate-600/30";
    dot = "bg-slate-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {upper}
    </span>
  );
};
