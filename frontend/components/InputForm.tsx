// =============================================================================
// InputForm.tsx — Form input untuk URL/HTML, algoritma, selector, dan limit
// =============================================================================

import { useState } from "react";
import type { FormState, ResultLimit } from "../src/types";

interface InputFormProps {
  onSubmit: (form: FormState) => void;
  isLoading: boolean;
}

/**
 * Komponen form yang menangani semua input dari pengguna sebelum dikirim ke API.
 */
export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  // State internal form
  const [inputMode, setInputMode] = useState<"url" | "html">("url");
  const [inputValue, setInputValue] = useState("");
  const [algorithm, setAlgorithm] = useState<"BFS" | "DFS">("BFS");
  const [cssSelector, setCssSelector] = useState("");
  const [limitType, setLimitType] = useState<"all" | "top-n">("all");
  const [topN, setTopN] = useState(10);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const resultLimit: ResultLimit =
      limitType === "all" ? { type: "all" } : { type: "top-n", n: topN };

    onSubmit({
      inputValue,
      inputMode,
      algorithm,
      cssSelector,
      resultLimit,
    });
  }

  // Styling shared untuk input fields
  const inputClass =
    "w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 font-mono text-sm " +
    "text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 " +
    "focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200";

  const labelClass = "block text-xs font-bold text-zinc-400 tracking-widest uppercase mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Mode Toggle: URL vs Raw HTML ─────────────────────────────── */}
      <div>
        <label className={labelClass}>Input Mode</label>
        <div className="flex rounded overflow-hidden border border-zinc-700">
          {(["url", "html"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setInputMode(mode)}
              className={[
                "flex-1 py-2 text-xs font-bold font-mono tracking-widest uppercase transition-all duration-200",
                inputMode === mode
                  ? "bg-cyan-500/20 text-cyan-300 border-r border-cyan-500/30"
                  : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border-r border-zinc-700",
              ].join(" ")}
            >
              {mode === "url" ? "🌐 URL" : "</> HTML"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input URL atau Raw HTML ───────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          {inputMode === "url" ? "Website URL" : "Raw HTML"}
        </label>
        {inputMode === "url" ? (
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://example.com"
            required
            className={inputClass}
          />
        ) : (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={"<html>\n  <body>\n    <div class=\"container\">\n      ...\n    </div>\n  </body>\n</html>"}
            required
            rows={6}
            className={inputClass + " resize-y leading-relaxed"}
          />
        )}
      </div>

      {/* ── Pilihan Algoritma ─────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>Traversal Algorithm</label>
        <div className="grid grid-cols-2 gap-3">
          {(["BFS", "DFS"] as const).map((algo) => (
            <button
              key={algo}
              type="button"
              onClick={() => setAlgorithm(algo)}
              className={[
                "relative py-3 px-4 rounded border text-sm font-bold font-mono tracking-widest transition-all duration-200",
                algorithm === algo
                  ? algo === "BFS"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "border-purple-500 bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "border-zinc-700 bg-zinc-900 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300",
              ].join(" ")}
            >
              <div className="text-base mb-0.5">{algo === "BFS" ? "⬡" : "⬢"}</div>
              <div>{algo}</div>
              <div className="text-[9px] font-normal text-current opacity-60 mt-0.5">
                {algo === "BFS" ? "Breadth-First" : "Depth-First"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── CSS Selector ─────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>CSS Selector</label>
        <input
          type="text"
          value={cssSelector}
          onChange={(e) => setCssSelector(e.target.value)}
          placeholder=".class-name, #id, div > p, [attr]"
          required
          className={inputClass}
        />
        {/* Quick selector presets */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {["div", "p", "a", "h1", ".container", "#main", "img"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setCssSelector(s)}
              className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-500 
                         hover:text-cyan-400 hover:bg-zinc-700 rounded border border-zinc-700 
                         hover:border-cyan-500/40 transition-all duration-150"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Jumlah Hasil ─────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>Result Limit</label>
        <div className="flex rounded overflow-hidden border border-zinc-700 mb-3">
          {(["all", "top-n"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setLimitType(t)}
              className={[
                "flex-1 py-2 text-xs font-bold font-mono tracking-widest uppercase transition-all duration-200",
                limitType === t
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "bg-zinc-900 text-zinc-500 hover:text-zinc-300",
                "border-r border-zinc-700 last:border-r-0",
              ].join(" ")}
            >
              {t === "all" ? "All Results" : "Top N"}
            </button>
          ))}
        </div>

        {limitType === "top-n" && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={1000}
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value) || 1)}
              className={inputClass + " w-28"}
            />
            <span className="text-xs text-zinc-500 font-mono">kemunculan pertama</span>
          </div>
        )}
      </div>

      {/* ── Submit Button ─────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isLoading}
        className={[
          "w-full py-3 rounded font-bold font-mono text-sm tracking-widest uppercase",
          "border transition-all duration-300 relative overflow-hidden",
          isLoading
            ? "border-zinc-700 bg-zinc-800 text-zinc-500 cursor-not-allowed"
            : "border-cyan-500 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20",
          "shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]",
        ].join(" ")}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-zinc-500 border-t-cyan-400 rounded-full animate-spin" />
            Traversing...
          </span>
        ) : (
          "⟶ Run Traversal"
        )}
      </button>
    </form>
  );
}
