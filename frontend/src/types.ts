// =============================================================================
// types.ts — Interface TypeScript yang cocok PERSIS dengan response Go backend
// =============================================================================

// ---------------------------------------------------------------------------
// DOM Tree Node
// Cocok dengan struct treeNodeJSON di main.go
// ---------------------------------------------------------------------------

export interface TreeNodeData {
  tag: string;
  text?: string;
  /** Selalu ada (bisa kosong {}), tidak pernah null */
  attributes: Record<string, string>;
  children: TreeNodeData[];
  depth: number;
  /** true jika node ini dikunjungi selama traversal */
  isTraversed: boolean;
  /** true jika node ini match dengan CSS selector */
  isMatched: boolean;
  /** Berupa nodePath string, e.g. "0/1/2" */
  nodeId: string;
}

// ---------------------------------------------------------------------------
// Traversal Log Entry
// Cocok dengan struct logEntryJSON di main.go
// ---------------------------------------------------------------------------

export interface TraversalLogEntry {
  step: number;
  nodeTag: string;
  nodeId: string;
  message: string;
  isMatch: boolean;
}

// ---------------------------------------------------------------------------
// Performance Metrics
// Cocok dengan struct metricsJSON di main.go
// ---------------------------------------------------------------------------

export interface PerformanceMetrics {
  /** Waktu dalam milidetik (DurationMs dari Go) */
  searchTimeMs: number;
  /** VisitedCount dari SearchResult */
  visitedNodeCount: number;
  /** len(Matches) dari SearchResult */
  matchedNodeCount: number;
  /** Kedalaman maksimum seluruh pohon */
  maxDepth: number;
}

// ---------------------------------------------------------------------------
// Full API Response — cocok dengan struct traverseResponse di main.go
// ---------------------------------------------------------------------------

export interface ApiResponse {
  tree: TreeNodeData;
  traversalLog: TraversalLogEntry[];
  metrics: PerformanceMetrics;
  algorithm: "BFS" | "DFS";
  selector: string;
}

// ---------------------------------------------------------------------------
// Request payload — cocok dengan struct traverseRequest di main.go
// ---------------------------------------------------------------------------

export interface TraverseRequest {
  input: string;
  inputMode: "url" | "html";
  algorithm: "BFS" | "DFS";
  cssSelector: string;
  /** 0 = semua hasil, N = top-N */
  limit: number;
}

// ---------------------------------------------------------------------------
// Form state internal (tidak dikirim langsung ke API)
// ---------------------------------------------------------------------------

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