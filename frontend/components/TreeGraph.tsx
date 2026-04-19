import { useMemo, useState } from "react";
import type { TreeNodeData } from "../src/types";

interface TreeGraphProps {
  root: TreeNodeData;
}

interface PositionedNode {
  node: TreeNodeData;
  x: number;
  y: number;
  children: PositionedNode[];
}

const NODE_W = 90;
const NODE_H = 34;
const H_GAP = 18;
const V_GAP = 60;

// Hitung lebar subtree berdasarkan jumlah leaf
function computeLeafCount(n: TreeNodeData): number {
  if (!n.children || n.children.length === 0) return 1;
  return n.children.reduce((sum, c) => sum + computeLeafCount(c), 0);
}

// Layout rekursif: setiap node ditempatkan di tengah anak-anaknya
function layout(
  node: TreeNodeData,
  depth: number,
  xOffset: number
): { positioned: PositionedNode; width: number } {
  const leafCount = computeLeafCount(node);
  const width = leafCount * (NODE_W + H_GAP);

  if (!node.children || node.children.length === 0) {
    return {
      positioned: {
        node,
        x: xOffset + width / 2,
        y: depth * V_GAP + NODE_H,
        children: [],
      },
      width,
    };
  }

  let cursor = xOffset;
  const childPositions: PositionedNode[] = [];
  for (const child of node.children) {
    const { positioned, width: cw } = layout(child, depth + 1, cursor);
    childPositions.push(positioned);
    cursor += cw;
  }

  const firstX = childPositions[0].x;
  const lastX = childPositions[childPositions.length - 1].x;
  const centerX = (firstX + lastX) / 2;

  return {
    positioned: {
      node,
      x: centerX,
      y: depth * V_GAP + NODE_H,
      children: childPositions,
    },
    width,
  };
}

// Flatten untuk render
function flatten(p: PositionedNode, list: PositionedNode[] = []): PositionedNode[] {
  list.push(p);
  p.children.forEach((c) => flatten(c, list));
  return list;
}

function getEdges(p: PositionedNode, edges: [PositionedNode, PositionedNode][] = []) {
  for (const c of p.children) {
    edges.push([p, c]);
    getEdges(c, edges);
  }
  return edges;
}

export default function TreeGraph({ root }: TreeGraphProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const { allNodes, edges, totalWidth, totalHeight } = useMemo(() => {
    const { positioned, width } = layout(root, 0, 0);
    const nodes = flatten(positioned);
    const eds = getEdges(positioned);
    const maxY = Math.max(...nodes.map((n) => n.y)) + NODE_H * 2;
    return {
      allNodes: nodes,
      edges: eds,
      totalWidth: Math.max(width, 600),
      totalHeight: maxY + 40,
    };
  }, [root]);

  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/70 backdrop-blur-md border border-white/60 rounded-lg shadow-sm p-1">
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
          className="w-7 h-7 rounded-md text-slate-500 hover:bg-slate-100 transition-colors text-sm font-bold"
        >
          −
        </button>
        <span className="text-[10px] font-mono text-slate-500 w-10 text-center">
          {(zoom * 100).toFixed(0)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          className="w-7 h-7 rounded-md text-slate-500 hover:bg-slate-100 transition-colors text-sm font-bold"
        >
          +
        </button>
        <button
          onClick={() => setZoom(1)}
          className="w-7 h-7 rounded-md text-slate-500 hover:bg-slate-100 transition-colors text-[10px]"
        >
          ⤢
        </button>
      </div>

      {/* Canvas */}
      <div
        className="overflow-auto rounded-xl border border-white/40 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 relative"
        style={{
          maxHeight: 580,
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.18) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <svg
          width={totalWidth * zoom}
          height={totalHeight * zoom}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="block"
        >
          <defs>
            <linearGradient id="edge-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="node-matched" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="node-traversed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="node-idle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges (Bezier) */}
          <g>
            {edges.map(([from, to], i) => {
              const x1 = from.x;
              const y1 = from.y + NODE_H / 2;
              const x2 = to.x;
              const y2 = to.y - NODE_H / 2;
              const midY = (y1 + y2) / 2;
              const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
              const isActive = to.node.isTraversed;
              return (
                <path
                  key={i}
                  d={path}
                  stroke={isActive ? "url(#edge-grad)" : "#e2e8f0"}
                  strokeWidth={isActive ? 1.6 : 1}
                  fill="none"
                  strokeLinecap="round"
                  className="transition-all"
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {allNodes.map((p) => {
              const { node } = p;
              const fill = node.isMatched
                ? "url(#node-matched)"
                : node.isTraversed
                ? "url(#node-traversed)"
                : "url(#node-idle)";
              const stroke = node.isMatched
                ? "#059669"
                : node.isTraversed
                ? "#7c3aed"
                : "#cbd5e1";
              const textColor =
                node.isMatched || node.isTraversed ? "#ffffff" : "#64748b";
              const isHover = hoverId === node.nodeId;

              return (
                <g
                  key={node.nodeId}
                  transform={`translate(${p.x - NODE_W / 2}, ${p.y - NODE_H / 2})`}
                  onMouseEnter={() => setHoverId(node.nodeId)}
                  onMouseLeave={() => setHoverId(null)}
                  className="cursor-pointer"
                  style={{ filter: node.isMatched ? "url(#glow)" : undefined }}
                >
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isHover ? 2 : 1.2}
                    opacity={node.isTraversed || node.isMatched ? 1 : 0.55}
                    className="transition-all duration-200"
                  />
                  {node.isMatched && (
                    <circle
                      cx={NODE_W - 8}
                      cy={8}
                      r={4}
                      fill="#fff"
                      stroke="#059669"
                      strokeWidth={1.2}
                    />
                  )}
                  <text
                    x={NODE_W / 2}
                    y={NODE_H / 2 + 4}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                    fontSize="11"
                    fontWeight="700"
                    fill={textColor}
                  >
                    &lt;{node.tag}&gt;
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Hover details */}
      {hoverId && (
        <div className="mt-3 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm">
          {(() => {
            const found = allNodes.find((n) => n.node.nodeId === hoverId);
            if (!found) return null;
            const n = found.node;
            return (
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-mono font-bold text-blue-600">
                  &lt;{n.tag}&gt;
                </span>
                <span className="text-slate-400">depth: <span className="font-mono text-slate-600">{n.depth}</span></span>
                <span className="text-slate-400">children: <span className="font-mono text-slate-600">{n.children?.length ?? 0}</span></span>
                {n.isMatched && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">MATCH</span>
                )}
                {Object.keys(n.attributes).length > 0 && (
                  <span className="font-mono text-[11px] text-slate-500 truncate">
                    {Object.entries(n.attributes).slice(0, 3).map(([k, v]) => `${k}="${v.slice(0, 24)}"`).join(" ")}
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}