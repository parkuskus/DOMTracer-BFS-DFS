import { useState } from "react";
import type { TreeNode as TreeNodeType } from "../src/types";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";

interface Props {
  node: TreeNodeType;
  index?: number;
}

function formatAttrs(a: Record<string, string>) {
  return Object.entries(a)
    .slice(0, 3)
    .map(([k, v]) => `${k}="${v.length > 24 ? v.slice(0, 24) + "…" : v}"`)
    .join(" ");
}

export default function TreeNode({ node, index = 0 }: Props) {
  const [open, setOpen] = useState(node.depth < 2);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const attrs = formatAttrs(node.attributes ?? {});

  return (
    <div
      className="relative pl-5 border-l border-primary/15 animate-fade-up"
      style={{ animationDelay: `${index * 25}ms` }}
    >
      <span className="absolute left-0 top-3.5 w-4 border-t border-primary/15" />

      <div className="flex items-start gap-2 py-1">
        {hasChildren ? (
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-primary hover:bg-primary-soft transition-colors"
          >
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="mt-0.5 w-5 h-5 flex items-center justify-center text-muted-foreground">·</span>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={[
              "px-2 py-0.5 rounded-md text-xs font-semibold border transition-all",
              node.isMatched
                ? "bg-gradient-primary text-primary-foreground border-transparent shadow-soft"
                : node.isTraversed
                ? "bg-primary-soft text-primary border-primary/20"
                : "bg-white/60 text-muted-foreground border-white/60",
            ].join(" ")}
          >
            &lt;{node.tag}&gt;
          </span>
          {attrs && (
            <span className="text-xs text-muted-foreground truncate max-w-md">{attrs}</span>
          )}
          {node.text && !hasChildren && (
            <span className="text-xs text-muted-foreground italic truncate max-w-xs">
              "{node.text.slice(0, 40)}{node.text.length > 40 ? "…" : ""}"
            </span>
          )}
          {node.isMatched && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
              <Sparkles className="w-3 h-3" /> match
            </span>
          )}
        </div>
      </div>

      {open && hasChildren && (
        <div className="ml-1">
          {node.children.map((c, i) => (
            // Gunakan nodeId sebagai key (unik dari backend)
            <TreeNode key={c.nodeId} node={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
