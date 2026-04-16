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

type Tab = "tree" | "log";

export default function App() {
  const [appState, setAppState] = useState<AppState>({ result: null, isLoading: false, error: null });
  const [activeTab, setActiveTab] = useState<Tab>("tree");

  async function handleSubmit(form: FormState) {
    setAppState({ result: null, isLoading: true, error: null });
    try {
      const result = await runTraversal(form);
      setAppState({ result, isLoading: false, error: null });
      setActiveTab("tree");
    } catch (err) {
      setAppState({
        result: null,
        isLoading: false,
        error: err instanceof Error ? err.message : "An unknown error occurred.",
      });
    }
  }

  const { result, isLoading, error } = appState;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200">
              <span className="text-white text-xs font-black">D</span>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800 tracking-tight">DOMTracer</span>
              <span className="ml-2 text-xs text-slate-400 font-medium">BFS / DFS Visualizer</span>
            </div>
          </div>

          {/* Tags */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-semibold tracking-widest uppercase">
              IF2211
            </span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-semibold tracking-widest uppercase">
              Tubes 2
            </span>
          </div>
        </div>
      </header>

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">

        {/* ╔══ LEFT: Input Panel ════════════════════════════════════════╗ */}
        <aside>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Panel header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
              <h2 className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                Configuration
              </h2>
            </div>
            <div className="px-6 py-5">
              <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* ── Node legend ────────────────────────────────────────────── */}
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-3">
              Node Legend
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  badge: "bg-emerald-50 ring-1 ring-emerald-300",
                  dot: "bg-emerald-400",
                  text: "text-emerald-700",
                  label: "Matched",
                  desc: "Matches the CSS selector",
                },
                {
                  badge: "bg-violet-50 ring-1 ring-violet-200",
                  dot: "bg-violet-400",
                  text: "text-violet-700",
                  label: "Traversed",
                  desc: "Visited by the algorithm",
                },
                {
                  badge: "bg-white ring-1 ring-slate-200 opacity-60",
                  dot: "bg-slate-300",
                  text: "text-slate-400",
                  label: "Unvisited",
                  desc: "Not visited / outside limit",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${item.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                    <span className={`font-mono text-[10px] font-semibold ${item.text}`}>&lt;tag&gt;</span>
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-slate-600">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ╔══ RIGHT: Output Panel ══════════════════════════════════════╗ */}
        <main className="space-y-5 min-w-0">

          {/* ── Loading ─────────────────────────────────────────────────── */}
          {isLoading && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-20 flex flex-col items-center gap-5">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-b-violet-400 animate-spin"
                     style={{ animationDirection: "reverse", animationDuration: "0.75s" }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Traversing DOM…</p>
                <p className="text-xs text-slate-400 mt-1">Parsing and searching the document tree</p>
              </div>
            </div>
          )}

          {/* ── Error ───────────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3 shadow-sm">
              <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Traversal Failed</p>
                <p className="text-xs text-red-500 font-mono leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* ── Empty state ─────────────────────────────────────────────── */}
          {!isLoading && !error && !result && (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-20 flex flex-col items-center gap-3 text-center shadow-sm">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-2xl">
                🌐
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">No traversal yet</p>
                <p className="text-xs text-slate-400 mt-1">Configure and run a traversal to see the DOM tree</p>
              </div>
            </div>
          )}

          {/* ── Results ─────────────────────────────────────────────────── */}
          {result && !isLoading && (
            <>
              {/* Metrics */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h2 className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                    Performance Metrics
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <MetricsPanel
                    metrics={result.metrics}
                    algorithm={result.algorithm}
                    selector={result.selector}
                  />
                </div>
              </div>

              {/* DOM Tree + Log tabs */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Tab bar */}
                <div className="flex border-b border-slate-100">
                  {([
                    { key: "tree" as Tab, icon: "⬡", label: "DOM Tree" },
                    { key: "log"  as Tab, icon: "≡", label: "Traversal Log" },
                  ]).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={[
                        "flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold tracking-wide transition-all border-b-2",
                        activeTab === tab.key
                          ? "border-blue-500 text-blue-600 bg-blue-50/50"
                          : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── Tree tab ────────────────────────────────────────── */}
                {activeTab === "tree" && (
                  <div className="p-6">
                    {/* Tree meta info */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-medium">
                          Max depth:
                          <span className="ml-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-mono font-semibold text-[10px]">
                            {result.metrics.maxDepth} levels
                          </span>
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Visited:
                          <span className="ml-1.5 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-mono font-semibold text-[10px]">
                            {result.metrics.visitedNodeCount} nodes
                          </span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-mono">
                        click [+] to expand nodes
                      </span>
                    </div>

                    {/* Scrollable tree area */}
                    <div className="overflow-auto max-h-[560px] pr-2">
                      <TreeNode node={result.tree} />
                    </div>
                  </div>
                )}

                {/* ── Log tab ─────────────────────────────────────────── */}
                {activeTab === "log" && (
                  <div className="p-6">
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