import { useState, useEffect } from "react";
import InputForm, { type FormState } from "../components/InputForm";
import TreeNode from "../components/TreeNode";
import TreeGraph from "../components/TreeGraph";
import MetricsPanel from "../components/MetricsPanel";
import TraversalLog from "../components/TraversalLog";
import { runTraversal, checkHealth } from "../src/api";
import type { ApiResponse } from "../src/types";
import { Network, ListTree, ScrollText, AlertCircle, Wifi, WifiOff } from "lucide-react";

type Tab = "graph" | "tree" | "log";

const Index = () => {
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("graph");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, []);

  async function handleSubmit(form: FormState) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiResponse = await runTraversal(form);
      setResult(apiResponse);
      setBackendOnline(true);
      setTab("graph");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi error yang tidak diketahui.";
      setError(msg);
      setBackendOnline(false);
    } finally {
      setIsLoading(false);
    }
  }

  const tabs: { id: Tab; label: string; Icon: typeof Network }[] = [
    { id: "graph", label: "Graph",  Icon: Network    },
    { id: "tree",  label: "Tree",   Icon: ListTree   },
    { id: "log",   label: "Log",    Icon: ScrollText },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Floating gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-primary/20 blur-3xl animate-float" />
        <div
          className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-primary-glow/20 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[28rem] h-[28rem] rounded-full bg-sky-300/20 blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Top bar */}
      <header className="glass-strong sticky top-0 z-40 border-b border-white/50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-black text-sm">D</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold tracking-tight">DOM Tracer</span>
              <span className="text-[11px] text-muted-foreground font-medium">BFS & DFS</span>
            </div>
          </div>

          {/* Backend status indicator */}
          <div className="flex items-center gap-2 text-xs font-medium">
            {backendOnline === null && (
              <span className="text-muted-foreground">Mengecek koneksi…</span>
            )}
            {backendOnline === true && (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Wifi className="w-3.5 h-3.5" />
                Online
              </span>
            )}
            {backendOnline === false && (
              <span className="flex items-center gap-1.5 text-destructive">
                <WifiOff className="w-3.5 h-3.5" />
                Backend offline
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 pt-16 pb-10 lg:pt-24 lg:pb-14 text-center">
        <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-balance max-w-4xl mx-auto">
          Trace your DOM,{" "}
          <span className="text-gradient">node by node</span>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
          A visualizer for breadth-first and depth-first traversal of HTML.
        </p>
      </section>

      {/* Workbench */}
      <main className="max-w-[1400px] mx-auto px-6 pb-16 grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-24 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg">Configure</h2>
            </div>
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </aside>

        <section className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">

          {/* Loading */}
          {isLoading && (
            <div className="glass rounded-2xl p-16 text-center">
              <div className="inline-flex items-center gap-3 text-sm font-semibold text-primary">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-soft" />
                Tracing document…
              </div>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="glass rounded-2xl p-6 border border-destructive/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-destructive text-sm">Traversal gagal</p>
                  <p className="text-sm text-muted-foreground break-all">{error}</p>
                  {!backendOnline && (
                    <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg p-3 font-mono">
                      $ go run ./main.go
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {!isLoading && result && (
            <>
              <MetricsPanel
                metrics={result.metrics}
                algorithm={result.algorithm}
                selector={result.selector}
              />

              {/* Tab switcher */}
              <div className="flex p-1 gap-1 glass rounded-2xl">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={[
                      "flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                      tab === t.id
                        ? "bg-gradient-primary text-primary-foreground shadow-soft"
                        : "text-foreground/60 hover:text-foreground hover:bg-white/60",
                    ].join(" ")}
                  >
                    <t.Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="animate-fade-up">
                {tab === "graph" && (
                  <TreeGraph
                    root={result.tree}
                    logs={result.traversalLog}
                  />
                )}
                {tab === "tree" && (
                  <div className="glass rounded-2xl p-6 max-h-[600px] overflow-auto">
                    <TreeNode node={result.tree} />
                  </div>
                )}
                {tab === "log" && (
                  <TraversalLog
                    logs={result.traversalLog}
                    algorithm={result.algorithm}
                  />
                )}
              </div>
            </>
          )}

          {/* Empty state */}
          {!isLoading && !result && !error && (
            <div className="glass rounded-2xl p-16 text-center text-muted-foreground">
              <Network className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                Please fill the form and <strong className="text-foreground">Run Traversal</strong>
              </p>
            </div>
          )}

        </section>
      </main>

      {/* Footer */}
      <footer className="glass-subtle border-t border-white/50 mt-8">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <span className="chip">© 2026</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
