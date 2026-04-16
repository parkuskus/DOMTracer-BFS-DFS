// =============================================================================
// App.tsx — Komponen induk utama. Mengelola state global dan fetch API.
// =============================================================================

import { useState } from "react";
import type { AppState, FormState } from "./types";
import { runTraversal } from "../src/api";
import InputForm from "../components/InputForm";
import TreeNode from "../components/TreeNode";
import MetricsPanel from "../components/MetricsPanel";
import TraversalLog from "../components/TraversalLog";

export default function App() {
  // ── State utama aplikasi ──────────────────────────────────────────────────
  const [appState, setAppState] = useState<AppState>({
    result: null,
    isLoading: false,
    error: null,
  });

  // Tab aktif di panel kanan (tree / log)
  const [activeTab, setActiveTab] = useState<"tree" | "log">("tree");

  // ── Handler submit form ───────────────────────────────────────────────────
  async function handleFormSubmit(form: FormState) {
    // Reset state & mulai loading
    setAppState({ result: null, isLoading: true, error: null });

    try {
      const result = await runTraversal(form);
      setAppState({ result, isLoading: false, error: null });
      // Auto-switch ke tab tree setelah dapat hasil
      setActiveTab("tree");
    } catch (err) {
      setAppState({
        result: null,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error occurred.",
      });
    }
  }

  const { result, isLoading, error } = appState;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans">
      {/* ── Scanline overlay effect ─────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded border border-cyan-500/60 flex items-center justify-center
                              shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <span className="text-cyan-400 text-xs font-bold">⬡</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-zinc-100 tracking-wider leading-none">
                  DOM<span className="text-cyan-400">Tracer</span>
                </h1>
                <p className="text-[9px] text-zinc-600 tracking-widest uppercase leading-none mt-0.5">
                  BFS / DFS CSS Selector Engine
                </p>
              </div>
            </div>
          </div>

          {/* Badge keterangan tugas */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-600 tracking-wider">
            <span className="px-2 py-1 border border-zinc-700 rounded">
              IF2211 · Strategi Algoritma
            </span>
            <span className="px-2 py-1 border border-zinc-700 rounded">
              Tubes 2
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Layout: dua kolom ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">

        {/* ╔══ KOLOM KIRI: Form Input ══════════════════════════════════════╗ */}
        <aside className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6
                          shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            {/* Header panel */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <h2 className="text-xs font-bold text-zinc-400 tracking-widest uppercase">
                Configuration
              </h2>
            </div>

            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>

          {/* ── Legend warna node ────────────────────────────────────────── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-3">
              Node Legend
            </h3>
            <div className="space-y-2">
              {[
                {
                  color: "bg-amber-400/20 ring-amber-400/60 text-amber-300",
                  label: "Matched Node",
                  desc: "Node cocok dengan selector",
                },
                {
                  color: "bg-cyan-500/15 ring-cyan-500/40 text-cyan-300",
                  label: "Traversed Node",
                  desc: "Node dikunjungi algoritma",
                },
                {
                  color: "bg-zinc-800 ring-zinc-700 text-zinc-400",
                  label: "Regular Node",
                  desc: "Node tidak dikunjungi",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ring-1 ${item.color}`}
                  >
                    &lt;tag&gt;
                  </span>
                  <div>
                    <div className="text-[11px] text-zinc-300 font-medium">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-zinc-600">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ╔══ KOLOM KANAN: Output Panel ═══════════════════════════════════╗ */}
        <main className="space-y-6 min-w-0">

          {/* ── Loading State ─────────────────────────────────────────────── */}
          {isLoading && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-16 flex flex-col
                            items-center justify-center gap-6 text-center">
              {/* Animated spinner */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-b-emerald-400 animate-spin"
                     style={{ animationDirection: "reverse", animationDuration: "0.7s" }} />
              </div>
              <div>
                <p className="text-sm font-mono text-cyan-400 tracking-widest mb-1">
                  TRAVERSING DOM...
                </p>
                <p className="text-xs text-zinc-600 font-mono">
                  Fetching and parsing the document tree
                </p>
              </div>
            </div>
          )}

          {/* ── Error State ───────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-6
                            shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl flex-shrink-0">⚠</span>
                <div>
                  <h3 className="text-sm font-bold text-red-300 mb-1 font-mono">
                    Traversal Failed
                  </h3>
                  <p className="text-xs text-red-400/80 font-mono leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Empty / Welcome State ─────────────────────────────────────── */}
          {!isLoading && !error && !result && (
            <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-16
                            flex flex-col items-center justify-center gap-4 text-center">
              <div className="text-5xl opacity-20">⬡</div>
              <div>
                <p className="text-sm text-zinc-500 font-mono">
                  Configure and run a traversal to see results
                </p>
                <p className="text-xs text-zinc-700 font-mono mt-1">
                  DOM tree visualization will appear here
                </p>
              </div>
            </div>
          )}

          {/* ── Result State ──────────────────────────────────────────────── */}
          {result && !isLoading && (
            <>
              {/* Metrik Performa */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-zinc-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <h2 className="text-xs font-bold text-zinc-400 tracking-widest uppercase">
                    Performance Metrics
                  </h2>
                </div>
                <MetricsPanel
                  metrics={result.metrics}
                  algorithm={result.algorithm}
                  selector={result.selector}
                />
              </div>

              {/* Panel Tab: DOM Tree / Traversal Log */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
                {/* Tab nav */}
                <div className="flex border-b border-zinc-700">
                  {([
                    { key: "tree", label: "DOM Tree", icon: "⬡" },
                    { key: "log", label: "Traversal Log", icon: "≡" },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={[
                        "flex-1 py-3 text-xs font-bold font-mono tracking-widest uppercase",
                        "border-b-2 transition-all duration-200",
                        activeTab === tab.key
                          ? "border-cyan-400 text-cyan-300 bg-cyan-500/5"
                          : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40",
                      ].join(" ")}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── DOM Tree Tab ─────────────────────────────────────── */}
                {activeTab === "tree" && (
                  <div className="p-5">
                    {/* Keterangan kedalaman maksimum */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-600 tracking-wider">
                        MAX DEPTH:{" "}
                        <span className="text-purple-400 font-bold">
                          {result.metrics.maxDepth}
                        </span>{" "}
                        LEVELS
                      </span>
                      <span className="text-[10px] font-mono text-zinc-600">
                        ▸ Click nodes to expand/collapse
                      </span>
                    </div>

                    {/* Pohon DOM rekursif */}
                    <div className="overflow-x-auto">
                      <TreeNode node={result.tree} />
                    </div>
                  </div>
                )}

                {/* ── Traversal Log Tab ────────────────────────────────── */}
                {activeTab === "log" && (
                  <div className="p-5">
                    <TraversalLog
                      logs={result.traversalLog}
                      algorithm={result.algorithm}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
