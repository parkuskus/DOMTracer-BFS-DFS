// =============================================================================
// MetricsPanel.tsx — Panel metrik performa hasil traversal
// =============================================================================

import type { PerformanceMetrics, ApiResponse } from "../src/types";

interface MetricsPanelProps {
  metrics: PerformanceMetrics;
  algorithm: ApiResponse["algorithm"];
  selector: string;
}

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
      color: "text-primary",
      bg: "bg-bfs-container",
      border: "border-outline-variant/30",
    },
    {
      label: "Nodes Visited",
      value: metrics.visitedNodeCount.toLocaleString(),
      unit: "nodes",
      icon: "○",
      color: "text-on-bfs",
      bg: "bg-bfs-container",
      border: "border-outline-variant/30",
    },
    {
      label: "Matches Found",
      value: metrics.matchedNodeCount.toLocaleString(),
      unit: "match",
      icon: "✦",
      color: "text-on-match",
      bg: "bg-match-container",
      border: "border-outline-variant/30",
    },
    {
      label: "Max Tree Depth",
      value: metrics.maxDepth.toString(),
      unit: "levels",
      icon: "⬇",
      color: "text-on-dfs",
      bg: "bg-dfs-container",
      border: "border-outline-variant/30",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={[
              "px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-widest",
              algorithm === "BFS"
                ? "bg-bfs-container text-on-bfs ring-1 ring-bfs/30"
                : "bg-dfs-container text-on-dfs ring-1 ring-dfs/30",
            ].join(" ")}
          >
            {algorithm}
          </span>
          <code className="text-xs bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded-md font-mono">
            {selector}
          </code>
        </div>
        <span className="text-[10px] text-outline font-mono tracking-wider uppercase">
          Traversal Complete
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={[
              "bg-surface-container-lowest border rounded-xl p-4 transition-all duration-200 shadow-sm",
              card.border,
            ].join(" ")}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-on-surface-variant tracking-widest uppercase">
                {card.label}
              </span>
              <span className={`text-base ${card.color} ${card.bg} w-7 h-7 rounded-lg flex items-center justify-center`}>
                {card.icon}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold font-mono ${card.color}`}>
                {card.value}
              </span>
              <span className="text-xs text-outline font-mono">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Match ratio */}
      {metrics.visitedNodeCount > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-semibold text-on-surface-variant tracking-widest uppercase">
              Match Ratio
            </span>
            <span className="text-xs font-mono text-on-surface-variant">
              {((metrics.matchedNodeCount / metrics.visitedNodeCount) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-bfs to-match rounded-full transition-all duration-700"
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