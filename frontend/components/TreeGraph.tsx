import { useMemo, useState } from "react";
import type { TreeNode } from "../src/types";

interface Props { root: TreeNode; }
interface PN { node: TreeNode; x: number; y: number; children: PN[]; }

const NODE_W = 96;
const NODE_H = 36;
const H_GAP = 18;
const V_GAP = 76;

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

export default function TreeGraph({ root }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const { nodes, eds, w, h } = useMemo(() => {
    const { p, w } = layout(root, 0, 0);
    const ns = flatten(p);
    const es = edges(p);
    const maxY = Math.max(...ns.map((n) => n.y)) + NODE_H * 2;
    return { nodes: ns, eds: es, w: Math.max(w, 600), h: maxY };
  }, [root]);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-white/50 bg-white/40">
        <span className="text-sm font-semibold text-foreground/80">Tree graph</span>
        <span className="text-xs text-muted-foreground font-medium">{nodes.length} nodes</span>
      </header>
      <div className="overflow-auto p-6 flex-1 min-h-0">
        <svg width={w} height={h} className="block">
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
    </div>
  );
}
