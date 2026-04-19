// =============================================================================
// InputForm.tsx — Form input untuk URL/HTML, algoritma, selector, dan limit
// =============================================================================

import { useState } from "react";
import type { FormState, ResultLimit } from "../src/types";
import { Link2, SquareDashedMousePointer, Play } from "lucide-react";

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
    "w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm " +
    "text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 " +
    "focus:ring-primary-container/30 transition-all duration-200";

  const labelClass = "block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode Toggle */}
      <div>
        <label className={labelClass}>Input Mode</label>
        <div className="flex bg-surface-container-highest p-1 rounded-lg">
          {(["url", "html"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setInputMode(mode)}
              className={[
                "flex-1 py-2 text-xs font-headline font-bold uppercase tracking-wider rounded-md transition-all duration-200",
                inputMode === mode
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-low",
              ].join(" ")}
            >
              {mode === "url" ? "Input URL" : "Input HTML"}
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
          <div className="relative">
            <input
              type="url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://example.com"
              required
              className={inputClass}
            />
            <Link2 className="h-4 w-4 text-outline-variant absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
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
        <label className={labelClass}>Metode Traversal</label>
        <div className="grid grid-cols-2 gap-3">
          {(["BFS", "DFS"] as const).map((algo) => (
            <button
              key={algo}
              type="button"
              onClick={() => setAlgorithm(algo)}
              className={[
                "relative py-3 px-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 border",
                algorithm === algo
                  ? algo === "BFS"
                    ? "bg-bfs-container text-on-bfs ring-2 ring-bfs/35 border-bfs"
                    : "bg-dfs-container text-on-dfs ring-2 ring-dfs/35 border-dfs"
                  : "bg-surface-container-highest text-on-surface-variant border-transparent hover:border-outline-variant",
              ].join(" ")}
            >
              <div className="text-xs font-headline uppercase tracking-widest">
                {algo === "BFS" ? "Breadth-First (BFS)" : "Depth-First (DFS)"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CSS Selector */}
      <div>
        <label className={labelClass}>CSS Selector Utama</label>
        <div className="relative">
          <input
            type="text"
            value={cssSelector}
            onChange={(e) => setCssSelector(e.target.value)}
            placeholder="body > main"
            required
            className={inputClass + " font-mono"}
          />
          <SquareDashedMousePointer className="h-4 w-4 text-outline-variant absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          {["div", "p", "a", "h1", ".container", "#main", "img"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setCssSelector(s)}
              className="px-2.5 py-1.5 text-[10px] font-mono bg-surface-container-highest text-on-surface-variant
                         hover:text-primary hover:bg-surface-container-low rounded-md border border-outline-variant/30
                         hover:border-primary/40 transition-all duration-150"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result Limit */}
      <div>
        <label className={labelClass}>Result Limit</label>
        <div className="flex rounded-lg overflow-hidden border border-outline-variant/30 mb-4 bg-surface-container-highest">
          {(["all", "top-n"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setLimitType(t)}
              className={[
                "flex-1 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200",
                limitType === t
                  ? "bg-surface-container-lowest text-primary"
                  : "text-on-surface-variant hover:text-on-surface",
                "border-r border-outline-variant/20 last:border-r-0",
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
            <span className="text-xs text-on-surface-variant">kemunculan pertama</span>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={[
          "w-full py-4 px-2 rounded-xl font-headline font-black text-sm uppercase tracking-[0.2em] transition-all duration-300",
          isLoading
            ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
            : "bg-primary text-on-primary shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98]",
        ].join(" ")}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3.5 h-3.5 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
            Traversing...
          </span>
        ) : (
          <span className="inline-flex items-center justify-center gap-2">
            Jalankan Traversal
            <Play className="h-4 w-4" strokeWidth={2.4} />
          </span>
        )}
      </button>
    </form>
  );
}