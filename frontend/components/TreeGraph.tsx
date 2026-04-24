import { useMemo, useState } from "react";
import type { LogEntry, TreeNode } from "../src/types";
import { Check, Filter, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  root: TreeNode;
  logs?: LogEntry[];
  algorithm?: string;
}
interface PN { node: TreeNode; x: number; y: number; children: PN[]; }

const NODE_W = 96;
const NODE_H = 36;
const H_GAP = 18;
const V_GAP = 76;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.8;
const ZOOM_STEP = 0.15;

function leafCount(n: TreeNode): number {
  if (!n.children?.length) return 1;
  return n.children.reduce((s, c) => s + leafCount(c), 0);
}

function layout(n: TreeNode, depth: number, xOff: number): { p: PN; w: number } {
  const w = leafCount(n) * (NODE_W + H_GAP);
  if (!n.children?.length) {
    return { p: { node: n, x: xOff + w / 2, y: depth * V_GAP + NODE_H, children: [] }, w };
  }
  let cur = xOff;
  const cps: PN[] = [];
  for (const c of n.children) {
    const r = layout(c, depth + 1, cur);
    cps.push(r.p);
    cur += r.w;
  }
  const cx = (cps[0].x + cps[cps.length - 1].x) / 2;
  return { p: { node: n, x: cx, y: depth * V_GAP + NODE_H, children: cps }, w };
}

function flatten(p: PN, out: PN[] = []): PN[] {
  out.push(p);
  p.children.forEach((c) => flatten(c, out));
  return out;
}

function edges(p: PN, out: [PN, PN][] = []): [PN, PN][] {
  for (const c of p.children) { out.push([p, c]); edges(c, out); }
  return out;
}

export default function TreeGraph({ root, logs = [], algorithm }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const [zoom, setZoom] = useState(1);

  const { nodes, eds, w, h } = useMemo(() => {
    const { p, w } = layout(root, 0, 0);
    const ns = flatten(p);
    const es = edges(p);
    const maxY = Math.max(...ns.map((n) => n.y)) + NODE_H * 2;
    return { nodes: ns, eds: es, w: Math.max(w, 600), h: maxY };
  }, [root]);

  const filteredLogs = showOnlyMatches ? logs.filter((l) => l.isMatch) : logs;
  const matchCount = logs.filter((l) => l.isMatch).length;
  const zoomPercent = Math.round(zoom * 100);

  function updateZoom(delta: number) {
    setZoom((value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value + delta)));
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/50 bg-white/40">
        <div className="min-w-0">
          <span className="text-sm font-semibold text-foreground/80">Tree graph</span>
          <span className="ml-2 text-xs text-muted-foreground font-medium">{nodes.length} nodes</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateZoom(-ZOOM_STEP)}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/70 text-foreground/70 hover:bg-white border border-white/60 transition-all disabled:opacity-40"
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-xs font-semibold text-foreground/70 tabular-nums">
            {zoomPercent}%
          </span>
          <button
            type="button"
            onClick={() => updateZoom(ZOOM_STEP)}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/70 text-foreground/70 hover:bg-white border border-white/60 transition-all disabled:opacity-40"
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/70 text-foreground/70 hover:bg-white border border-white/60 transition-all"
            aria-label="Reset zoom"
            title="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>
      <div className="flex flex-col min-h-[460px]">
        <div className="overflow-auto p-6 min-h-[420px] max-h-[640px]">
          <svg
            width={w * zoom}
            height={h * zoom}
            viewBox={`0 0 ${w} ${h}`}
            className="block"
          >
            <defs>
              <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="edgeMatch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="nodeMatch" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {eds.map(([a, b], i) => {
              const targetX = a.x === b.x ? b.x + 0.1 : b.x;

              return (
                <path
                  key={i}
                  d={`M ${a.x} ${a.y + NODE_H / 2} C ${a.x} ${(a.y + b.y) / 2}, ${targetX} ${(a.y + b.y) / 2}, ${targetX} ${b.y - NODE_H / 2}`}
                  stroke={b.node.isMatched ? "url(#edgeMatch)" : "url(#edge)"}
                  strokeWidth={b.node.isMatched ? 2 : 1.5}
                  fill="none"
                />
              );
            })}

            {nodes.map((p) => {
              const isHover = hover === p.node.nodeId;
              const isMatch = p.node.isMatched;
              return (
                <g
                  key={p.node.nodeId}
                  transform={`translate(${p.x - NODE_W / 2}, ${p.y - NODE_H / 2})`}
                  onMouseEnter={() => setHover(p.node.nodeId)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                  filter={isMatch ? "url(#glow)" : undefined}
                >
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    fill={isMatch ? "url(#nodeMatch)" : "hsl(0 0% 100% / 0.85)"}
                    stroke={
                      isMatch
                        ? "transparent"
                        : isHover
                        ? "hsl(var(--primary))"
                        : "hsl(var(--primary) / 0.25)"
                    }
                    strokeWidth={1.5}
                  />
                  <text
                    x={NODE_W / 2}
                    y={NODE_H / 2 + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight={isMatch ? 700 : 600}
                    fontFamily="Sora, system-ui, sans-serif"
                    fill={isMatch ? "white" : "hsl(var(--foreground))"}
                  >
                    &lt;{p.node.tag}&gt;
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="border-t border-white/50 bg-white/30 flex flex-col min-h-[240px] max-h-[360px]">
          <header className="px-4 py-3 border-b border-white/50 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground/80 truncate">
                traversal {algorithm ? `- ${algorithm}` : ""} - {logs.length} steps
              </p>
              <p className="text-[11px] text-muted-foreground">{matchCount} matches</p>
            </div>
            <button
              type="button"
              onClick={() => setShowOnlyMatches((v) => !v)}
              className={[
                "h-8 w-8 rounded-lg inline-flex items-center justify-center transition-all shrink-0",
                showOnlyMatches
                  ? "bg-gradient-primary text-primary-foreground shadow-soft"
                  : "bg-white/70 text-foreground/70 hover:bg-white border border-white/60",
              ].join(" ")}
              aria-label="Filter matches"
              title="Filter matches"
            >
              <Filter className="w-4 h-4" />
            </button>
          </header>

          <div className="overflow-y-auto flex-1">
            {filteredLogs.length === 0 ? (
              <div className="px-4 py-10 text-center text-muted-foreground text-sm">No entries.</div>
            ) : (
              <ol className="divide-y divide-white/40">
                {filteredLogs.map((l) => (
                  <li
                    key={l.step}
                    className={[
                      "px-4 py-2.5 flex items-start gap-2.5 text-xs transition-colors hover:bg-white/40",
                      l.isMatch ? "bg-primary-soft/40" : "",
                    ].join(" ")}
                  >
                    <span className="w-8 pt-0.5 font-semibold text-muted-foreground tabular-nums shrink-0">
                      #{String(l.step).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary-soft text-primary shrink-0">
                          &lt;{l.nodeTag}&gt;
                        </span>
                        <span className="font-mono text-[11px] text-foreground/45 truncate">
                          {l.nodeId}
                        </span>
                        {l.isMatch && (
                          <Check className="w-3.5 h-3.5 text-success shrink-0" />
                        )}
                      </div>
                      <p className="text-foreground/70 leading-snug line-clamp-2">{l.message}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
