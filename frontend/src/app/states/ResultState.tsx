import MetricsPanel from "../../../components/MetricsPanel";
import TraversalLog from "../../../components/TraversalLog";
import TreeNode from "../../../components/TreeNode";
import type { ApiResponse } from "../../types";

type Tab = "tree" | "log";

interface ResultStateProps {
  result: ApiResponse;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function ResultState({ result, activeTab, onTabChange }: ResultStateProps) {
  return (
    <>
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-match rounded-full" />
          <h2 className="text-xs font-semibold text-on-surface-variant tracking-widest uppercase">
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

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-outline-variant/15 bg-surface-container-low">
          {([
            { key: "tree" as Tab, icon: "⬡", label: "DOM Tree" },
            { key: "log" as Tab, icon: "≡", label: "Traversal Log" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={[
                "flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold tracking-wide transition-all border-b-2",
                activeTab === tab.key
                  ? "border-primary text-primary bg-surface-container-lowest"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high",
              ].join(" ")}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "tree" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-outline-variant/15">
              <div className="flex items-center gap-3">
                <span className="text-xs text-on-surface-variant font-medium">
                  Max depth:
                  <span className="ml-1.5 px-2 py-0.5 bg-dfs-container text-on-dfs rounded-full font-mono font-semibold text-[10px]">
                    {result.metrics.maxDepth} levels
                  </span>
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  Visited:
                  <span className="ml-1.5 px-2 py-0.5 bg-bfs-container text-on-bfs rounded-full font-mono font-semibold text-[10px]">
                    {result.metrics.visitedNodeCount} nodes
                  </span>
                </span>
              </div>
              <span className="text-[10px] text-outline font-mono">
                click [+] to expand nodes
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
  );
}
