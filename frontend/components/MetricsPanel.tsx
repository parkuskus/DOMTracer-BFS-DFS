import type { PerformanceMetrics } from "./lib/mockData";
import { Clock, CircleDot, Sparkles, ArrowDown, ShapesIcon } from "lucide-react";

interface Props {
  metrics: PerformanceMetrics;
  algorithm: "BFS" | "DFS";
  selector: string;
}

export default function MetricsPanel({ metrics, algorithm, selector }: Props) {
  const cards = [
    { label: "Search time", value: metrics.searchTimeMs.toFixed(3), unit: "ms", Icon: Clock },
    { label: "Nodes visited", value: metrics.visitedNodeCount.toLocaleString(), unit: "nodes", Icon: CircleDot },
    { label: "Matches", value: metrics.matchedNodeCount.toLocaleString(), unit: "found", Icon: ShapesIcon },
    { label: "Max depth", value: String(metrics.maxDepth), unit: "levels", Icon: ArrowDown },
  ];

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
            {algorithm}
          </span>
          <span className="text-xs text-muted-foreground">
            selector <span className="text-foreground font-medium">{selector}</span>
          </span>
        </div>
        <span className="text-xs text-muted-foreground">Trace complete</span>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white/60 border border-white/50 rounded-xl p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <c.Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{c.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">{c.value}</span>
              <span className="text-xs text-muted-foreground">{c.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
