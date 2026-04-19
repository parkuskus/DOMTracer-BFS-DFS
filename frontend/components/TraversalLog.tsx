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
    <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/25">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-bfs" />
            <span className="w-2.5 h-2.5 rounded-full bg-dfs" />
            <span className="w-2.5 h-2.5 rounded-full bg-match" />
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant tracking-wider">
            traversal.log — {algorithm} — {logs.length} steps
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyMatches((v) => !v)}
            className={[
              "px-2.5 py-1 text-[10px] font-semibold rounded-md tracking-wide transition-all",
              showOnlyMatches
                ? "bg-match-container text-on-match ring-1 ring-match/35"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
          >
            ✦ {matchCount} MATCHES
          </button>

          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="px-2 py-1 text-[10px] font-mono text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {isCollapsed ? "▾ EXPAND" : "▴ COLLAPSE"}
          </button>
        </div>
      </div>

      {/* Log entries */}
      {!isCollapsed && (
        <div className="bg-surface-container-lowest max-h-72 overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="px-4 py-6 text-center text-on-surface-variant">
              {showOnlyMatches ? "No matches found." : "No log entries."}
            </div>
          ) : (
            filteredLogs.map((entry) => (
              <div
                key={entry.step}
                className={[
                  "flex items-start gap-3 px-4 py-1.5 border-b border-outline-variant/15",
                  "hover:bg-surface-container-low transition-colors duration-100",
                  entry.isMatch ? "bg-match-container/60" : "",
                ].join(" ")}
              >
                <span className="text-outline w-7 text-right flex-shrink-0 pt-px">
                  {entry.step.toString().padStart(3, "0")}
                </span>

                <span
                  className={[
                    "flex-shrink-0 w-16 text-center px-1 py-0.5 rounded text-[10px] font-bold",
                    entry.isMatch
                      ? "bg-match-container text-on-match ring-1 ring-match/30"
                      : "bg-surface-container-high text-on-surface-variant",
                  ].join(" ")}
                >
                  &lt;{entry.nodeTag}&gt;
                </span>

                <span
                  className={entry.isMatch ? "text-on-match" : "text-on-surface-variant"}
                >
                  {entry.isMatch && (
                    <span className="text-match mr-1.5">✦</span>
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