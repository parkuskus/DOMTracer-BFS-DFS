import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Globe, Code2, Search, Sparkles, FileUp, X } from "lucide-react";

export type Algorithm = "BFS" | "DFS";

export interface FormState {
  inputMode: "url" | "html" | "file";
  inputValue: string;
  algorithm: Algorithm;
  cssSelector: string;
  limitType: "all" | "top-n";
  topN: number;
}

interface Props {
  onSubmit: (form: FormState) => void;
  isLoading: boolean;
}

const labelCls = "block text-xs font-semibold tracking-wide text-foreground/70 mb-2.5";

export default function InputForm({ onSubmit, isLoading }: Props) {
  const [inputMode, setInputMode] = useState<"url" | "html" | "file">("url");
  const [inputValue, setInputValue] = useState("https://example.com");
  const [algorithm, setAlgorithm] = useState<Algorithm>("BFS");
  const [cssSelector, setCssSelector] = useState("a.link-primary");
  const [limitType, setLimitType] = useState<"all" | "top-n">("all");
  const [topN, setTopN] = useState(10);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputCls =
    "rounded-xl bg-white/70 border-white/60 backdrop-blur h-11 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInputValue(ev.target?.result as string ?? "");
    };
    reader.readAsText(file);
  };

  const clearFile = () => {
    setFileName(null);
    setInputValue("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleModeSwitch = (mode: "url" | "html" | "file") => {
    setInputMode(mode);
    // Reset input value when switching modes
    if (mode === "url") setInputValue("https://example.com");
    else if (mode === "html") setInputValue("");
    else {
      setInputValue("");
      setFileName(null);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ inputMode, inputValue, algorithm, cssSelector, limitType, topN });
      }}
      className="space-y-5"
    >
      {/* Input source toggle — now 3 columns */}
      <div>
        <label className={labelCls}>Input source</label>
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/50 border border-white/60">
          {([
            { id: "url",  label: "URL",  Icon: Globe   },
            { id: "html", label: "HTML", Icon: Code2   },
            { id: "file", label: "File", Icon: FileUp  },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleModeSwitch(id)}
              className={[
                "py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                inputMode === id
                  ? "bg-gradient-primary text-primary-foreground shadow-soft"
                  : "text-foreground/60 hover:text-foreground hover:bg-white/60",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic input area */}
      <div>
        <label className={labelCls}>
          {inputMode === "url" ? "Website URL" : inputMode === "html" ? "Raw HTML" : "HTML File"}
        </label>

        {inputMode === "url" && (
          <Input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://example.com"
            className={inputCls}
          />
        )}

        {inputMode === "html" && (
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="<html>…</html>"
            rows={5}
            className="rounded-xl bg-white/70 border-white/60 backdrop-blur text-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        )}

        {inputMode === "file" && (
          <>
            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              onChange={handleFileChange}
              className="hidden"
              id="html-file-upload"
            />

            {fileName ? (
              /* File selected — show pill with name + clear button */
              <div className="flex items-center gap-2 px-4 h-11 rounded-xl bg-white/70 border border-white/60 backdrop-blur">
                <FileUp className="w-4 h-4 text-primary shrink-0" />
                <span className="flex-1 text-sm truncate text-foreground">{fileName}</span>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Clear file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Drop-zone style trigger */
              <label
                htmlFor="html-file-upload"
                className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-white/60 bg-white/40 backdrop-blur cursor-pointer hover:bg-white/60 hover:border-primary/40 transition-all group"
              >
                <FileUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Click to browse <span className="font-semibold">.html</span> / <span className="font-semibold">.htm</span> files
                </span>
              </label>
            )}
          </>
        )}
      </div>

      {/* Algorithm */}
      <div>
        <label className={labelCls}>Algorithm</label>
        <div className="grid grid-cols-2 gap-2">
          {(["BFS", "DFS"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAlgorithm(a)}
              className={[
                "py-3 rounded-xl text-left px-4 transition-all border",
                algorithm === a
                  ? "bg-gradient-primary text-primary-foreground border-transparent shadow-soft"
                  : "bg-white/60 border-white/60 hover:bg-white/80 text-foreground",
              ].join(" ")}
            >
              <div className="font-display font-bold text-base">{a}</div>
              <div className={["text-[11px] mt-0.5", algorithm === a ? "text-white/85" : "text-muted-foreground"].join(" ")}>
                {a === "BFS" ? "Breadth First" : "Depth First"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CSS selector */}
      <div>
        <label className={labelCls}>CSS selector</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={cssSelector}
            onChange={(e) => setCssSelector(e.target.value)}
            placeholder="div.card > a"
            className={inputCls + " pl-9"}
          />
        </div>
      </div>

      {/* Result limit */}
      <div>
        <label className={labelCls}>Result limit</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLimitType("all")}
            className={[
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border",
              limitType === "all"
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-white/60 border-white/60 hover:bg-white/80",
            ].join(" ")}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setLimitType("top-n")}
            className={[
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border",
              limitType === "top-n"
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-white/60 border-white/60 hover:bg-white/80",
            ].join(" ")}
          >
            Top N
          </button>
          {limitType === "top-n" && (
            <Input
              type="number"
              min={1}
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value || "1", 10))}
              className={inputCls + " w-20 text-center"}
            />
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-gradient-primary hover:shadow-glow text-primary-foreground font-display font-semibold text-sm transition-all"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse-soft" />
            Tracing…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Run Traversal
          </span>
        )}
      </Button>
    </form>
  );
}
