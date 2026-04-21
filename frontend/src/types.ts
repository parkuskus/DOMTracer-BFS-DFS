export interface TreeNode {
  tag: string;
  text?: string;
  attributes: Record<string, string>;
  children: TreeNode[];
  depth: number;
  isTraversed: boolean;
  isMatched: boolean;
  nodeId: string; // path seperti "0/1/2"
}

export interface LogEntry {
  step: number;
  nodeTag: string;
  nodeId: string;
  message: string;
  isMatch: boolean;
}

export interface Metrics {
  searchTimeMs: number;
  visitedNodeCount: number;
  matchedNodeCount: number;
  maxDepth: number;
}

export interface ApiResponse {
  tree: TreeNode;
  traversalLog: LogEntry[];
  metrics: Metrics;
  algorithm: string;
  selector: string;
}

export interface TraverseRequest {
  input: string;
  inputMode: string; // "url" | "html"
  algorithm: string; // "BFS" | "DFS"
  cssSelector: string;
  limit: number;     // 0 = semua, N = top-N
}
