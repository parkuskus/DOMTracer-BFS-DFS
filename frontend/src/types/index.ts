export interface TreeNodeData {
  tag: string;
  text?: string;
  attributes: Record<string, string>;
  children: TreeNodeData[];
  depth: number;
  isTraversed: boolean;
  isMatched: boolean;
  nodeId: string;
}

export interface TraversalLogEntry {
  step: number;
  nodeTag: string;
  nodeId: string;
  message: string;
  isMatch: boolean;
}

export interface PerformanceMetrics {
  searchTimeMs: number;
  visitedNodeCount: number;
  matchedNodeCount: number;
  maxDepth: number;
}

export interface ApiResponse {
  tree: TreeNodeData;
  traversalLog: TraversalLogEntry[];
  metrics: PerformanceMetrics;
  algorithm: "BFS" | "DFS";
  selector: string;
}

export interface TraverseRequest {
  input: string;
  inputMode: "url" | "html";
  algorithm: "BFS" | "DFS";
  cssSelector: string;
  limit: number;
}

export type ResultLimit =
  | { type: "top-n"; n: number }
  | { type: "all" };

export interface FormState {
  inputValue: string;
  inputMode: "url" | "html";
  algorithm: "BFS" | "DFS";
  cssSelector: string;
  resultLimit: ResultLimit;
}

export interface AppState {
  result: ApiResponse | null;
  isLoading: boolean;
  error: string | null;
}

export type InputMode = "url" | "html";
export type LimitMode = "top" | "all";