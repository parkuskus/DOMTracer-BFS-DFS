// =============================================================================
// InputForm.tsx — Form input untuk URL/HTML, algoritma, selector, dan limit
// =============================================================================

import { useState } from "react";
import type { FormState, ResultLimit } from "../src/types";

interface InputFormProps {
  onSubmit: (form: FormState) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
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
    onSubmit({ inputValue, inputMode, algorithm, cssSelector, resultLimit });
  }

  const inputClass =
    "w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm " +
    "text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 " +
    "focus:ring-2 focus:ring-blue-100 transition-all duration-200";

  const labelClass = "block text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-3";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Toggle */}
      <div>
        <label className={labelClass}>Input Mode</label>
        <div className="flex rounded-lg overflow-hidden border border-slate-200">
          {(["url", "html"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setInputMode(mode)}
              className={[
                "flex-1 py-3.5 text-xs font-semibold tracking-wide transition-all duration-200",
                inputMode === mode
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                  : "bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              {mode === "url" ? "🌐 URL" : "</> HTML"}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
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
            placeholder={'<html>\n  <body>\n    <div class="container">…</div>\n  </body>\n</html>'}
            required
            rows={6}
            className={inputClass + " resize-y leading-relaxed font-mono text-xs"}
          />
        )}
      </div>

      {/* Algorithm */}
      <div>
        <label className={labelClass}>Traversal Algorithm</label>
        <div className="grid grid-cols-2 gap-3">
          {(["BFS", "DFS"] as const).map((algo) => (
            <button
              key={algo}
              type="button"
              onClick={() => setAlgorithm(algo)}
              className={[
                "relative py-4 px-4 rounded-lg border text-sm font-bold tracking-wide transition-all duration-200",
                algorithm === algo
                  ? algo === "BFS"
                    ? "border-violet-300 bg-violet-50 text-violet-700 shadow-sm"
                    : "border-violet-300 bg-violet-50 text-violet-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600",
              ].join(" ")}
            >
              <div className="font-mono">{algo}</div>
              <div className="text-[9px] font-normal opacity-60 mt-0.5">
                {algo === "BFS" ? "Breadth-First" : "Depth-First"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CSS Selector */}
      <div>
        <label className={labelClass}>CSS Selector</label>
        <input
          type="text"
          value={cssSelector}
          onChange={(e) => setCssSelector(e.target.value)}
          placeholder=".class-name, #id, div > p, [attr]"
          required
          className={inputClass + " font-mono"}
        />
        <div className="flex flex-wrap gap-2 mt-6">
          {["div", "p", "a", "h1", ".container", "#main", "img"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setCssSelector(s)}
              className="px-2.5 py-1.5 text-[10px] font-mono bg-slate-50 text-slate-400 
                         hover:text-blue-600 hover:bg-blue-50 rounded-md border border-slate-200 
                         hover:border-blue-200 transition-all duration-150"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result Limit */}
      <div>
        <label className={labelClass}>Result Limit</label>
        <div className="flex rounded-lg overflow-hidden border border-slate-200 mb-4">
          {(["all", "top-n"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setLimitType(t)}
              className={[
                "flex-1 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200",
                limitType === t
                  ? "bg-blue-50 text-blue-600"
                  : "bg-white text-slate-400 hover:text-slate-600",
                "border-r border-slate-200 last:border-r-0",
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
              className={inputClass + " w-28 font-mono"}
            />
            <span className="text-xs text-slate-400">kemunculan pertama</span>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={[
          "w-full py-3 px-2 rounded-lg font-semibold text-sm tracking-wide",
          "border transition-all duration-300",
          isLoading
            ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            : "border-blue-500 bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200",
        ].join(" ")}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3.5 h-3.5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            Traversing...
          </span>
        ) : (
          "Run Traversal"
        )}
      </button>
    </form>
  );
}