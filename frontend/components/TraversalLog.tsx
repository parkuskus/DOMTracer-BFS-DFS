// =============================================================================
// TraversalLog.tsx — Tampilan log traversal step-by-step
// =============================================================================

import { useState } from "react";
import type { TraversalLogEntry } from "../src/types";

interface TraversalLogProps {
  logs: TraversalLogEntry[];
  algorithm: "BFS" | "DFS";
}

export default function TraversalLog({ logs, algorithm }: TraversalLogProps) {
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredLogs = showOnlyMatches
    ? logs.filter((l) => l.isMatch)
    : logs;

  const matchCount = logs.filter((l) => l.isMatch).length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] font-mono text-slate-400 tracking-wider">
            traversal.log — {algorithm} — {logs.length} steps
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyMatches((v) => !v)}
            className={[
              "px-2.5 py-1 text-[10px] font-semibold rounded-md tracking-wide transition-all",
              showOnlyMatches
                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                : "bg-slate-100 text-slate-400 hover:text-slate-600",
            ].join(" ")}
          >
            ✦ {matchCount} MATCHES
          </button>

          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="px-2 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isCollapsed ? "▾ EXPAND" : "▴ COLLAPSE"}
          </button>
        </div>
      </div>

      {/* Log entries */}
      {!isCollapsed && (
        <div className="bg-white max-h-72 overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-400">
              {showOnlyMatches ? "No matches found." : "No log entries."}
            </div>
          ) : (
            filteredLogs.map((entry) => (
              <div
                key={entry.step}
                className={[
                  "flex items-start gap-3 px-4 py-1.5 border-b border-slate-100",
                  "hover:bg-slate-50 transition-colors duration-100",
                  entry.isMatch ? "bg-emerald-50/50" : "",
                ].join(" ")}
              >
                <span className="text-slate-300 w-7 text-right flex-shrink-0 pt-px">
                  {entry.step.toString().padStart(3, "0")}
                </span>

                <span
                  className={[
                    "flex-shrink-0 w-16 text-center px-1 py-0.5 rounded text-[10px] font-bold",
                    entry.isMatch
                      ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                      : "bg-slate-50 text-slate-400",
                  ].join(" ")}
                >
                  &lt;{entry.nodeTag}&gt;
                </span>

                <span
                  className={entry.isMatch ? "text-emerald-700" : "text-slate-500"}
                >
                  {entry.isMatch && (
                    <span className="text-emerald-500 mr-1.5">✦</span>
                  )}
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}