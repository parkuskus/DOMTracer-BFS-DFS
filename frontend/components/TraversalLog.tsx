// =============================================================================
// TraversalLog.tsx — Tampilan log traversal step-by-step
// =============================================================================

import { useState } from "react";
import type { TraversalLogEntry } from "../src/types";

interface TraversalLogProps {
  logs: TraversalLogEntry[];
  algorithm: "BFS" | "DFS";
}

/**
 * Menampilkan log traversal dalam format terminal/console.
 * Mendukung filter hanya match, dan bisa di-collapse.
 */
export default function TraversalLog({ logs, algorithm }: TraversalLogProps) {
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredLogs = showOnlyMatches
    ? logs.filter((l) => l.isMatch)
    : logs;

  const matchCount = logs.filter((l) => l.isMatch).length;

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden">
      {/* ── Header bar terminal ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-[11px] font-mono text-zinc-400 tracking-wider">
            traversal.log — {algorithm} — {logs.length} steps
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowOnlyMatches((v) => !v)}
            className={[
              "px-2 py-1 text-[10px] font-mono font-bold rounded tracking-widest transition-all",
              showOnlyMatches
                ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40"
                : "bg-zinc-700 text-zinc-400 hover:text-zinc-200",
            ].join(" ")}
          >
            ✦ {matchCount} MATCHES
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="px-2 py-1 text-[10px] font-mono text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            {isCollapsed ? "▾ EXPAND" : "▴ COLLAPSE"}
          </button>
        </div>
      </div>

      {/* ── Log entries ─────────────────────────────────────────────── */}
      {!isCollapsed && (
        <div className="bg-zinc-950 max-h-72 overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="px-4 py-6 text-center text-zinc-600">
              {showOnlyMatches ? "No matches found." : "No log entries."}
            </div>
          ) : (
            filteredLogs.map((entry) => (
              <div
                key={entry.step}
                className={[
                  "flex items-start gap-3 px-4 py-1.5 border-b border-zinc-900/60",
                  "hover:bg-zinc-900/40 transition-colors duration-100",
                  entry.isMatch ? "bg-amber-400/5" : "",
                ].join(" ")}
              >
                {/* Step number */}
                <span className="text-zinc-700 w-7 text-right flex-shrink-0 pt-px">
                  {entry.step.toString().padStart(3, "0")}
                </span>

                {/* Node tag */}
                <span
                  className={[
                    "flex-shrink-0 w-16 text-center px-1 py-0.5 rounded text-[10px] font-bold",
                    entry.isMatch
                      ? "bg-amber-400/20 text-amber-300"
                      : "bg-zinc-800 text-zinc-400",
                  ].join(" ")}
                >
                  &lt;{entry.nodeTag}&gt;
                </span>

                {/* Pesan */}
                <span
                  className={
                    entry.isMatch ? "text-amber-200/80" : "text-zinc-500"
                  }
                >
                  {entry.isMatch && (
                    <span className="text-amber-400 mr-1.5">✦</span>
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
