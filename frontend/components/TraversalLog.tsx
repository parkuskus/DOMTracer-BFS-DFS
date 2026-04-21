import { useState } from "react";
import type { LogEntry } from "../src/types";
import { Check, Filter } from "lucide-react";

interface Props {
  logs: LogEntry[];
  algorithm: string;
}

export default function TraversalLog({ logs, algorithm }: Props) {
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const filtered = showOnlyMatches ? logs.filter((l) => l.isMatch) : logs;
  const matchCount = logs.filter((l) => l.isMatch).length;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-white/50 bg-white/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="ml-2 text-sm font-semibold text-foreground/80">
            traversal · {algorithm} · {logs.length} steps
          </span>
        </div>
        <button
          onClick={() => setShowOnlyMatches((v) => !v)}
          className={[
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
            showOnlyMatches
              ? "bg-gradient-primary text-primary-foreground shadow-soft"
              : "bg-white/70 text-foreground/70 hover:bg-white border border-white/60",
          ].join(" ")}
        >
          <Filter className="w-3 h-3" />
          {matchCount} matches
        </button>
      </header>

      <div className="max-h-80 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground text-sm">No entries.</div>
        ) : (
          <ul className="divide-y divide-white/40">
            {filtered.map((l, i) => (
              <li
                key={l.step}
                className={[
                  "px-5 py-2.5 flex items-center gap-3 text-sm transition-colors hover:bg-white/40 animate-fade-up",
                  l.isMatch ? "bg-primary-soft/40" : "",
                ].join(" ")}
                style={{ animationDelay: `${i * 20}ms` }}
              >
                {/* Step number */}
                <span className="w-10 text-xs font-semibold text-muted-foreground tabular-nums">
                  #{String(l.step).padStart(2, "0")}
                </span>

                {/* Node tag badge */}
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary-soft text-primary">
                  &lt;{l.nodeTag}&gt;
                </span>

                {/* Node path */}
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/70 border border-white/60 text-foreground/50 hidden sm:block">
                  {l.nodeId}
                </span>

                {/* Message */}
                <span className="flex-1 text-foreground/80 truncate text-xs">{l.message}</span>

                {/* Match indicator */}
                {l.isMatch && (
                  <span className="inline-flex items-center gap-1 text-success text-xs font-bold shrink-0">
                    <Check className="w-3.5 h-3.5" /> match
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
