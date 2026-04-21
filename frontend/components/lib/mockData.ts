// Mock DOM traversal data for the modern visualizer

export interface TreeNodeData {
  id: string;
  tag: string;
  attributes: Record<string, string>;
  depth: number;
  children: TreeNodeData[];
  isTraversed: boolean;
  isMatched: boolean;
}

export interface TraversalLogEntry {
  step: number;
  nodeId: string;
  tag: string;
  depth: number;
  isMatch: boolean;
  note: string;
}

export interface PerformanceMetrics {
  searchTimeMs: number;
  visitedNodeCount: number;
  matchedNodeCount: number;
  maxDepth: number;
}

export interface TraversalResult {
  algorithm: "BFS" | "DFS";
  selector: string;
  tree: TreeNodeData;
  logs: TraversalLogEntry[];
  metrics: PerformanceMetrics;
}

let _id = 0;
const nid = () => `n${++_id}`;

const node = (
  tag: string,
  attributes: Record<string, string>,
  depth: number,
  matched: boolean,
  traversed: boolean,
  children: TreeNodeData[] = []
): TreeNodeData => ({
  id: nid(),
  tag,
  attributes,
  depth,
  isTraversed: traversed,
  isMatched: matched,
  children,
});

export const mockTree: TreeNodeData = node("html", { lang: "en" }, 0, false, true, [
  node("head", {}, 1, false, true, [
    node("title", {}, 2, false, true),
    node("meta", { charset: "utf-8" }, 2, false, true),
  ]),
  node("body", { class: "page" }, 1, false, true, [
    node("header", { class: "site-header" }, 2, false, true, [
      node("nav", { class: "primary" }, 3, false, true, [
        node("a", { href: "/", class: "link-primary" }, 4, true, true),
        node("a", { href: "/about", class: "link-primary" }, 4, true, true),
      ]),
    ]),
    node("main", { id: "content" }, 2, false, true, [
      node("article", { class: "post" }, 3, false, true, [
        node("h1", { class: "headline" }, 4, false, true),
        node("p", { class: "lede" }, 4, false, true),
        node("a", { href: "#read", class: "link-primary" }, 4, true, true),
      ]),
      node("aside", { class: "sidebar" }, 3, false, true, [
        node("a", { href: "/tag", class: "link-primary" }, 4, true, true),
      ]),
    ]),
    node("footer", { class: "site-footer" }, 2, false, true, [
      node("a", { href: "/tos", class: "link-secondary" }, 3, false, true),
    ]),
  ]),
]);

export const mockLogs: TraversalLogEntry[] = [
  { step: 1, nodeId: "n1", tag: "html", depth: 0, isMatch: false, note: "enqueue root" },
  { step: 2, nodeId: "n2", tag: "head", depth: 1, isMatch: false, note: "visit" },
  { step: 3, nodeId: "n5", tag: "body", depth: 1, isMatch: false, note: "visit" },
  { step: 4, nodeId: "n3", tag: "title", depth: 2, isMatch: false, note: "visit" },
  { step: 5, nodeId: "n4", tag: "meta", depth: 2, isMatch: false, note: "visit" },
  { step: 6, nodeId: "n6", tag: "header", depth: 2, isMatch: false, note: "visit" },
  { step: 7, nodeId: "n10", tag: "main", depth: 2, isMatch: false, note: "visit" },
  { step: 8, nodeId: "n17", tag: "footer", depth: 2, isMatch: false, note: "visit" },
  { step: 9, nodeId: "n7", tag: "nav", depth: 3, isMatch: false, note: "visit" },
  { step: 10, nodeId: "n8", tag: "a", depth: 4, isMatch: true, note: "match a.link-primary" },
  { step: 11, nodeId: "n9", tag: "a", depth: 4, isMatch: true, note: "match a.link-primary" },
  { step: 12, nodeId: "n13", tag: "a", depth: 4, isMatch: true, note: "match a.link-primary" },
  { step: 13, nodeId: "n15", tag: "a", depth: 4, isMatch: true, note: "match a.link-primary" },
];

export const mockMetrics: PerformanceMetrics = {
  searchTimeMs: 1.482,
  visitedNodeCount: 17,
  matchedNodeCount: 4,
  maxDepth: 4,
};

export const mockResult: TraversalResult = {
  algorithm: "BFS",
  selector: "a.link-primary",
  tree: mockTree,
  logs: mockLogs,
  metrics: mockMetrics,
};
