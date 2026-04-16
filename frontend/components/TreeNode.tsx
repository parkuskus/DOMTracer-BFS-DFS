// =============================================================================
// TreeNode.tsx — Komponen rekursif untuk visualisasi satu node pohon DOM
// =============================================================================

import { useState } from "react";
import type { TreeNodeData } from "../src/types";

interface TreeNodeProps {
  node: TreeNodeData;
  /** Indeks anak (untuk animasi stagger) */
  childIndex?: number;
}

/**
 * Menghasilkan string ringkasan atribut untuk ditampilkan di label node.
 * Contoh: id="header" class="container"
 */
function formatAttributes(attributes: Record<string, string>): string {
  return Object.entries(attributes)
    .slice(0, 3) // Batasi 3 atribut agar tidak terlalu panjang
    .map(([k, v]) => `${k}="${v.length > 20 ? v.slice(0, 20) + "…" : v}"`)
    .join(" ");
}

/**
 * Menentukan warna border kiri berdasarkan kedalaman node (depth-based coloring).
 * Memberikan efek visual spektrum warna pada pohon.
 */
function getDepthColor(depth: number): string {
  const colors = [
    "border-l-cyan-400",
    "border-l-emerald-400",
    "border-l-yellow-400",
    "border-l-orange-400",
    "border-l-pink-400",
    "border-l-purple-400",
    "border-l-blue-400",
  ];
  return colors[depth % colors.length];
}

/**
 * Komponen rekursif utama.
 * Memanggil dirinya sendiri untuk setiap child, menciptakan struktur pohon berjenjang.
 */
export default function TreeNode({ node, childIndex = 0 }: TreeNodeProps) {
  // State untuk toggle collapse/expand cabang
  const [isExpanded, setIsExpanded] = useState(node.depth < 2);

  const hasChildren = node.children && node.children.length > 0;
  const attrString = formatAttributes(node.attributes);
  const depthColor = getDepthColor(node.depth);

  // Kelas styling berdasarkan status traversal
  const nodeBaseClass = [
    "group relative flex flex-col",
    "pl-4 border-l-2",
    depthColor,
    // Highlight khusus untuk node yang di-traversal
    node.isTraversed
      ? "border-l-opacity-100"
      : "border-l-opacity-20 opacity-60",
  ].join(" ");

  // Kelas untuk badge tag HTML
  const tagBadgeClass = [
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-xs font-bold tracking-wider transition-all duration-200",
    node.isMatched
      ? // Node yang match: warna gold/amber mencolok
        "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
      : node.isTraversed
      ? // Node yang dilalui (traversed) tapi tidak match: aksen cyan
        "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40"
      : // Node biasa: abu-abu subtle
        "bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700",
  ].join(" ");

  return (
    <div
      className={nodeBaseClass}
      style={{
        // Animasi masuk staggered berdasarkan index anak
        animationDelay: `${childIndex * 30}ms`,
      }}
    >
      {/* ── Baris utama node ─────────────────────────────────────────── */}
      <div className="flex items-start gap-2 py-1 group/row">
        {/* Tombol expand/collapse */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="mt-0.5 flex-shrink-0 w-4 h-4 rounded flex items-center justify-center
                       text-zinc-500 hover:text-cyan-400 hover:bg-zinc-800 transition-all duration-150"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <span className="text-[10px] leading-none">
              {isExpanded ? "▾" : "▸"}
            </span>
          </button>
        ) : (
          // Spacer agar alignment tetap rapi untuk leaf node
          <span className="w-4 flex-shrink-0" />
        )}

        {/* ── Label node ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {/* Badge nama tag */}
          <span className={tagBadgeClass}>
            {node.isMatched && (
              <span className="text-amber-400 text-[10px]">✦</span>
            )}
            &lt;{node.tag}&gt;
          </span>

          {/* Atribut-atribut HTML */}
          {attrString && (
            <span className="font-mono text-[11px] text-zinc-500 truncate max-w-[280px]">
              {attrString}
            </span>
          )}

          {/* Teks konten (jika ada dan tidak terlalu panjang) */}
          {node.text && node.text.trim() && (
            <span className="font-mono text-[11px] text-zinc-400 italic truncate max-w-[200px]">
              "{node.text.trim().slice(0, 40)}
              {node.text.trim().length > 40 ? "…" : ""}"
            </span>
          )}

          {/* Badge jumlah anak */}
          {hasChildren && (
            <span className="text-[10px] text-zinc-600 font-mono">
              [{node.children.length} child{node.children.length > 1 ? "ren" : ""}]
            </span>
          )}

          {/* Indikator matched */}
          {node.isMatched && (
            <span className="ml-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full tracking-widest">
              MATCH
            </span>
          )}
        </div>
      </div>

      {/* ── Children (rekursif) ───────────────────────────────────────── */}
      {hasChildren && isExpanded && (
        <div className="ml-2 mt-0.5">
          {node.children.map((child, idx) => (
            <TreeNode key={child.nodeId || idx} node={child} childIndex={idx} />
          ))}
        </div>
      )}

      {/* Collapsed indicator */}
      {hasChildren && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="ml-6 mb-1 text-[10px] text-zinc-600 hover:text-cyan-400 font-mono transition-colors"
        >
          · · · {node.children.length} node{node.children.length > 1 ? "s" : ""} hidden · · ·
        </button>
      )}
    </div>
  );
}
