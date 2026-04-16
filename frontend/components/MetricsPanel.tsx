// =============================================================================
// MetricsPanel.tsx — Panel metrik performa hasil traversal
// =============================================================================

import type { PerformanceMetrics, ApiResponse } from "../src/types";

interface MetricsPanelProps {
  metrics: PerformanceMetrics;
  algorithm: ApiResponse["algorithm"];
  selector: string;
}

/**
 * Menampilkan kartu-kartu metrik: waktu, node visited, match count, max depth.
 */
export default function MetricsPanel({
  metrics,
  algorithm,
  selector,
}: MetricsPanelProps) {
  const cards = [
    {
      label: "Search Time",
      value: `${metrics.searchTimeMs.toFixed(3)}`,
      unit: "ms",
      icon: "⏱",
      color: "text-cyan-400",
      glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
      border: "border-cyan-500/30",
    },
    {
      label: "Nodes Visited",
      value: metrics.visitedNodeCount.toLocaleString(),
      unit: "nodes",
      icon: "⬡",
      color: "text-emerald-400",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
      border: "border-emerald-500/30",
    },
    {
      label: "Matches Found",
      value: metrics.matchedNodeCount.toLocaleString(),
      unit: "match",
      icon: "✦",
      color: "text-amber-400",
      glow: "shadow-[0_0_15px_rgba(251,191,36,0.15)]",
      border: "border-amber-500/30",
    },
    {
      label: "Max Tree Depth",
      value: metrics.maxDepth.toString(),
      unit: "levels",
      icon: "⬇",
      color: "text-purple-400",
      glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
      border: "border-purple-500/30",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ── Header info traversal ──────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={[
              "px-2.5 py-1 rounded text-xs font-bold font-mono tracking-widest",
              algorithm === "BFS"
                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40"
                : "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/40",
            ].join(" ")}
          >
            {algorithm}
          </span>
          <code className="text-xs bg-zinc-800 text-amber-300 px-2 py-1 rounded font-mono">
            {selector}
          </code>
        </div>
        <span className="text-[10px] text-zinc-600 font-mono tracking-wider">
          TRAVERSAL COMPLETE
        </span>
      </div>

      {/* ── Kartu-kartu metrik ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={[
              "bg-zinc-900 border rounded-lg p-4 transition-all duration-200",
              card.border,
              card.glow,
            ].join(" ")}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                {card.label}
              </span>
              <span className={`text-base ${card.color}`}>{card.icon}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold font-mono ${card.color}`}>
                {card.value}
              </span>
              <span className="text-xs text-zinc-600 font-mono">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Progress bar: efisiensi traversal ─────────────────────── */}
      {metrics.visitedNodeCount > 0 && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
              Match Ratio
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {((metrics.matchedNodeCount / metrics.visitedNodeCount) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(
                  100,
                  (metrics.matchedNodeCount / metrics.visitedNodeCount) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
