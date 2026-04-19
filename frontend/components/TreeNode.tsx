// =============================================================================
// TreeNode.tsx — Komponen rekursif untuk visualisasi satu node pohon DOM
// =============================================================================

import { useState } from "react";
import type { TreeNodeData } from "../src/types";

interface TreeNodeProps {
  node: TreeNodeData;
  childIndex?: number;
}

function formatAttributes(attributes: Record<string, string>): string {
  return Object.entries(attributes)
    .slice(0, 3)
    .map(([k, v]) => `${k}="${v.length > 20 ? v.slice(0, 20) + "…" : v}"`)
    .join(" ");
}

function getDepthColor(depth: number): string {
  const colors = [
    "border-l-primary",
    "border-l-secondary",
    "border-l-dfs",
    "border-l-outline",
    "border-l-match",
    "border-l-bfs",
    "border-l-outline-variant",
  ];
  return colors[depth % colors.length];
}

export default function TreeNode({ node, childIndex = 0 }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(node.depth < 2);

  const hasChildren = node.children && node.children.length > 0;
  const attrString = formatAttributes(node.attributes);
  const depthColor = getDepthColor(node.depth);

  const nodeBaseClass = [
    "group relative flex flex-col",
    "pl-4 border-l-2",
    depthColor,
    node.isTraversed
      ? "border-l-opacity-100"
      : "border-l-opacity-20 opacity-50",
  ].join(" ");

  const tagBadgeClass = [
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-xs font-bold tracking-wider transition-all duration-200",
    node.isMatched
      ? "bg-match-container text-on-match ring-1 ring-match/35 shadow-sm"
      : node.isTraversed
      ? "bg-bfs-container text-on-bfs ring-1 ring-bfs/30"
      : "bg-surface-container-high text-on-surface-variant ring-1 ring-outline-variant/30",
  ].join(" ");

  return (
    <div
      className={nodeBaseClass}
      style={{ animationDelay: `${childIndex * 30}ms` }}
    >
      <div className="flex items-start gap-2 py-1">
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center
                       text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-150"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <span className="text-[10px] leading-none font-mono">
              {isExpanded ? "▾" : "▸"}
            </span>
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}

        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className={tagBadgeClass}>
            {node.isMatched && (
              <span className="text-match text-[10px]">✦</span>
            )}
            &lt;{node.tag}&gt;
          </span>

          {attrString && (
            <span className="font-mono text-[11px] text-on-surface-variant truncate max-w-[280px]">
              {attrString}
            </span>
          )}

          {node.text && node.text.trim() && (
            <span className="font-mono text-[11px] text-on-surface-variant italic truncate max-w-[200px]">
              "{node.text.trim().slice(0, 40)}
              {node.text.trim().length > 40 ? "…" : ""}"
            </span>
          )}

          {hasChildren && (
            <span className="text-[10px] text-outline font-mono">
              [{node.children.length} child{node.children.length > 1 ? "ren" : ""}]
            </span>
          )}

          {node.isMatched && (
            <span className="ml-1 text-[10px] font-bold text-on-match bg-match-container px-1.5 py-0.5 rounded-full tracking-widest">
              MATCH
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-2 mt-0.5 animate-expand">
          {node.children.map((child, idx) => (
            <TreeNode key={child.nodeId || idx} node={child} childIndex={idx} />
          ))}
        </div>
      )}

      {hasChildren && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="ml-6 mb-1 text-[10px] text-on-surface-variant hover:text-primary font-mono transition-colors"
        >
          · · · {node.children.length} node{node.children.length > 1 ? "s" : ""} hidden · · ·
        </button>
      )}
    </div>
  );
}