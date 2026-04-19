// =============================================================================
// Index.tsx — Halaman utama. Mengelola state global dan fetch API.
// =============================================================================

import { useState } from "react";
import type { AppState, FormState } from "./types";
import { runTraversal } from "./services/api";
import InputForm from "../components/InputForm";
import TreeNode from "../components/TreeNode";
import TreeGraph from "../components/TreeGraph";
import MetricsPanel from "../components/MetricsPanel";
import TraversalLog from "../components/TraversalLog";

type Tab = "graph" | "tree" | "log";

const Index = () => {
  const [appState, setAppState] = useState<AppState>({ result: null, isLoading: false, error: null });
  const [activeTab, setActiveTab] = useState<Tab>("graph");

  async function handleSubmit(form: FormState) {
    setAppState({ result: null, isLoading: true, error: null });
    try {
      const result = await runTraversal(form);
      setAppState({ result, isLoading: false, error: null });
      setActiveTab("graph");
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
    <div className="min-h-screen text-slate-900 relative">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-violet-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-300/40">
              <span className="text-white text-xs font-black">D</span>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-gradient">DOM Visualizer</span>
              <span className="ml-2 text-[11px] text-slate-500 font-medium">BFS / DFS</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-1 glass-subtle rounded-full text-[10px] font-semibold tracking-widest uppercase text-slate-600">
              IF2211
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase text-white bg-gradient-to-r from-blue-500 to-violet-500 shadow-sm">
              Tubes 2
            </span>
          </div>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
        {/* LEFT: Input Panel */}
        <aside>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/40 flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
              <h2 className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                Configuration
              </h2>
            </div>
            <div className="px-6 py-5">
              <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Node legend */}
          <div className="mt-4 glass rounded-2xl p-5">
            <h3 className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase mb-3">
              Node Legend
            </h3>
            <div className="space-y-2.5">
              {[
                { badge: "bg-emerald-50/80 ring-1 ring-emerald-300", dot: "bg-emerald-400", text: "text-emerald-700", label: "Matched", desc: "Matches the CSS selector" },
                { badge: "bg-violet-50/80 ring-1 ring-violet-200", dot: "bg-violet-400", text: "text-violet-700", label: "Traversed", desc: "Visited by the algorithm" },
                { badge: "bg-white/60 ring-1 ring-slate-200 opacity-70", dot: "bg-slate-300", text: "text-slate-400", label: "Unvisited", desc: "Not visited / outside limit" },
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

        {/* RIGHT: Output Panel */}
        <main className="space-y-5 min-w-0">
          {isLoading && (
            <div className="glass rounded-2xl p-20 flex flex-col items-center gap-5">
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

          {error && (
            <div className="glass rounded-2xl p-5 flex gap-3" style={{ background: "rgba(254, 242, 242, 0.7)" }}>
              <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Traversal Failed</p>
                <p className="text-xs text-red-500 font-mono leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && !result && (
            <div className="glass rounded-2xl p-20 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br from-blue-100 via-violet-100 to-emerald-100 shadow-inner">
                🌐
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">No traversal yet</p>
                <p className="text-xs text-slate-400 mt-1">Configure and run a traversal to see the DOM tree</p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <>
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/40 flex items-center gap-2">
                  <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-blue-500" />
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

              <div className="glass rounded-2xl overflow-hidden">
                <div className="flex border-b border-white/40">
                  {([
                    { key: "graph" as Tab, icon: "◊", label: "Tree Graph" },
                    { key: "tree" as Tab,  icon: "⬡", label: "DOM Outline" },
                    { key: "log"  as Tab,  icon: "≡", label: "Traversal Log" },
                  ]).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={[
                        "flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold tracking-wide transition-all border-b-2",
                        activeTab === tab.key
                          ? "border-blue-500 text-blue-600 bg-white/40"
                          : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-white/30",
                      ].join(" ")}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "graph" && (
                  <div className="p-6">
                    <TreeGraph root={result.tree} />
                  </div>
                )}

                {activeTab === "tree" && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/40 flex-wrap gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-slate-500 font-medium">
                          Max depth:
                          <span className="ml-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-mono font-semibold text-[10px]">
                            {result.metrics.maxDepth} levels
                          </span>
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Visited:
                          <span className="ml-1.5 px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full font-mono font-semibold text-[10px]">
                            {result.metrics.visitedNodeCount} nodes
                          </span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        click [▸] to expand nodes
                      </span>
                    </div>

                    <div className="overflow-auto max-h-[560px] pr-2">
                      <TreeNode node={result.tree} />
                    </div>
                  </div>
                )}

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
};

export default Index;