// =============================================================================
// App.tsx 
// =============================================================================

import { useState } from "react";
import type { AppState, FormState } from "../types";
import { runTraversal } from "../services/api";
import InputForm from "../../components/InputForm";
import { FlaskConical } from "lucide-react";
import LoadingState from "./states/LoadingState";
import ErrorState from "./states/ErrorState";
import EmptyState from "./states/EmptyState";
import ResultState from "./states/ResultState";

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
    <div className="min-h-screen bg-surface text-on-surface">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="bg-surface-container-lowest border-b border-outline-variant/40 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <FlaskConical className="h-4 w-4 text-primary" strokeWidth={2.5} />
            <div>
              <span className="font-headline text-[30px] font-bold tracking-tight text-on-surface">The Empirical Observatory</span>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6">
              <span className="font-headline tracking-tight uppercase text-sm font-bold text-primary border-b-2 border-primary py-1">Dashboard</span>
              <span className="font-headline tracking-tight uppercase text-sm font-medium text-on-surface-variant py-1">Eksperimen</span>
              <span className="font-headline tracking-tight uppercase text-sm font-medium text-on-surface-variant py-1">Arsip</span>
            </nav>
            <button className="px-5 py-2 rounded-lg bg-primary text-on-primary font-headline text-xs font-bold uppercase tracking-wider">
              Try Demo
            </button>
          </div>
        </div>
      </header>

      {/* ── Two-column layout ─────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">

        {/* ╔══ LEFT: Input Panel ════════════════════════════════════════╗ */}
        <aside className="w-full md:w-[380px] flex flex-col gap-6 shrink-0">
          <div className="bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col gap-6 border border-outline-variant/10">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                Laboratorium Traversal DOM
              </h2>
              <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                Konfigurasi parameter observasi untuk pemetaan struktur nodus.
              </p>
            </div>

            <div>
              <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* ── Node legend ────────────────────────────────────────────── */}
          <div className="bg-surface-container-high rounded-xl p-4 flex flex-col gap-3 border border-outline-variant/10">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-mono text-[10px] uppercase font-bold text-on-surface-variant">
                Skema Warna
              </h3>
            </div>

            <div className="space-y-2">
              {[
                {
                  dot: "bg-bfs",
                  label: "Elemen BFS Aktif",
                },
                {
                  dot: "bg-dfs",
                  label: "Elemen DFS Jalur",
                },
                {
                  dot: "bg-match",
                  label: "Elemen Selector Match",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-2 bg-surface-container-lowest rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${item.dot}`} />
                  <span className="font-mono text-[11px] text-on-surface-variant">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ╔══ RIGHT: Output Panel ══════════════════════════════════════╗ */}
        <main className="space-y-5 min-w-0">
          {isLoading && <LoadingState />}
          {error && <ErrorState error={error} />}
          {!isLoading && !error && !result && <EmptyState />}
          {result && !isLoading && (
            <ResultState
              result={result}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </main>
      </div>
    </div>
  );
}