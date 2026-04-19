import type { PerformanceMetrics } from "./lib/mockData";
import { Clock, CircleDot, Sparkles, ArrowDown } from "lucide-react";

interface Props {
  metrics: PerformanceMetrics;
  algorithm: "BFS" | "DFS";
  selector: string;
}

export default function MetricsPanel({ metrics, algorithm, selector }: Props) {
  const cards = [
    { label: "Search time", value: metrics.searchTimeMs.toFixed(3), unit: "ms", Icon: Clock, tint: "from-sky-400 to-blue-500" },
    { label: "Nodes visited", value: metrics.visitedNodeCount.toLocaleString(), unit: "nodes", Icon: CircleDot, tint: "from-blue-400 to-indigo-500" },
    { label: "Matches", value: metrics.matchedNodeCount.toLocaleString(), unit: "found", Icon: Sparkles, tint: "from-cyan-400 to-sky-500" },
    { label: "Max depth", value: String(metrics.maxDepth), unit: "levels", Icon: ArrowDown, tint: "from-indigo-400 to-blue-600" },
  ];

  return (
    <section className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="chip">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {algorithm}
          </span>
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground/70">selector</span>{" "}
            <span className="px-2 py-0.5 rounded-md bg-white/70 border border-white/60 text-foreground font-medium">{selector}</span>
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">Trace complete</span>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="glass rounded-2xl p-5 animate-fade-up relative overflow-hidden"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${c.tint} opacity-20 blur-2xl`} />
            <div className="flex items-center justify-between mb-3 relative">
              <span className="text-xs font-semibold text-muted-foreground">{c.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.tint} flex items-center justify-center text-white shadow-soft`}>
                <c.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 relative">
              <span className="font-display text-3xl font-bold tabular-nums text-foreground">{c.value}</span>
              <span className="text-xs text-muted-foreground font-medium">{c.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
