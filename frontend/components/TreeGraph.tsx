import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { LogEntry, TreeNode } from "../src/types";
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface Props {
  root: TreeNode;
  logs?: LogEntry[];
}
interface PN { node: TreeNode; x: number; y: number; children: PN[]; }

const NODE_W = 96;
const NODE_H = 36;
const H_GAP = 18;
const V_GAP = 76;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.8;
const ZOOM_STEP = 0.15;
const ACTIVE_COLOR = "hsl(132 95% 48%)";
const ACTIVE_FILL = "hsl(132 95% 48% / 0.24)";
const ACTIVE_NODE_FILL = "hsl(132 95% 48% / 0.36)";
const SPEED_OPTIONS = [
  { label: "0.25x", ms: 900 },
  { label: "0.5x", ms: 600 },
  { label: "1x", ms: 350 },
  { label: "2x", ms: 160 },
];

function leafCount(n: TreeNode): number {
  if (!n.children?.length) return 1;
  return n.children.reduce((s, c) => s + leafCount(c), 0);
}

function layout(n: TreeNode, depth: number, xOff: number): { p: PN; w: number } {
  const w = leafCount(n) * (NODE_W + H_GAP);
  if (!n.children?.length) {
    return { p: { node: n, x: xOff + w / 2, y: depth * V_GAP + NODE_H, children: [] }, w };
  }
  let cur = xOff;
  const cps: PN[] = [];
  for (const c of n.children) {
    const r = layout(c, depth + 1, cur);
    cps.push(r.p);
    cur += r.w;
  }
  const cx = (cps[0].x + cps[cps.length - 1].x) / 2;
  return { p: { node: n, x: cx, y: depth * V_GAP + NODE_H, children: cps }, w };
}

function flatten(p: PN, out: PN[] = []): PN[] {
  out.push(p);
  p.children.forEach((c) => flatten(c, out));
  return out;
}

function edges(p: PN, out: [PN, PN][] = []): [PN, PN][] {
  for (const c of p.children) { out.push([p, c]); edges(c, out); }
  return out;
}

export default function TreeGraph({ root, logs = [] }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [currentLogIndex, setCurrentLogIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(350);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { nodes, eds, w, h } = useMemo(() => {
    const { p, w } = layout(root, 0, 0);
    const ns = flatten(p);
    const es = edges(p);
    const maxY = Math.max(...ns.map((n) => n.y)) + NODE_H * 2;
    return { nodes: ns, eds: es, w: Math.max(w, 600), h: maxY };
  }, [root]);

  const currentLog = currentLogIndex >= 0 ? logs[currentLogIndex] : null;
  const visitedNodeIds = useMemo(
    () => new Set(logs.slice(0, currentLogIndex + 1).map((l) => l.nodeId)),
    [logs, currentLogIndex],
  );
  const progress = logs.length > 0 ? ((currentLogIndex + 1) / logs.length) * 100 : 0;
  const isAnimationComplete = logs.length > 0 && currentLogIndex >= logs.length - 1 && !isPlaying;
  const zoomPercent = Math.round(zoom * 100);

  useEffect(() => {
    setCurrentLogIndex(-1);
    setIsPlaying(logs.length > 0);
  }, [logs, root]);

  useEffect(() => {
    if (!isPlaying || logs.length === 0) return;

    const timer = window.setTimeout(() => {
      setCurrentLogIndex((index) => {
        if (index >= logs.length - 1) {
          setIsPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, speedMs);

    return () => window.clearTimeout(timer);
  }, [currentLogIndex, isPlaying, logs.length, speedMs]);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  function updateZoom(delta: number) {
    setZoom((value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value + delta)));
  }

  function restartAnimation() {
    setCurrentLogIndex(-1);
    setIsPlaying(logs.length > 0);
  }

  function togglePlayback() {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (currentLogIndex >= logs.length - 1) {
      setCurrentLogIndex(-1);
    }
    setIsPlaying(logs.length > 0);
  }

  function stepForward() {
    setIsPlaying(false);
    setCurrentLogIndex((index) => Math.min(logs.length - 1, index + 1));
  }

  const containerClass = [
    "glass overflow-hidden",
    isFullscreen
      ? "fixed inset-0 z-[100] rounded-none flex flex-col bg-background"
      : "rounded-2xl",
  ].join(" ");
  const contentClass = [
    "flex flex-col",
    isFullscreen ? "flex-1 min-h-0" : "min-h-[460px]",
  ].join(" ");
  const graphViewportClass = [
    "overflow-auto p-6",
    isFullscreen ? "flex-1 min-h-0 max-h-none" : "min-h-[420px] max-h-[640px]",
  ].join(" ");

  const graphPanel = (
    <div className={containerClass}>
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/50 bg-white/40">
        <div className="min-w-0">
          <span className="text-sm font-semibold text-foreground/80">Tree graph</span>
          <span className="ml-2 text-xs text-muted-foreground font-medium">{nodes.length} nodes</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={togglePlayback}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-gradient-primary text-primary-foreground shadow-soft transition-all disabled:opacity-40"
            disabled={logs.length === 0}
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
            title={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={stepForward}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/70 text-foreground/70 hover:bg-white border border-white/60 transition-all disabled:opacity-40"
            disabled={logs.length === 0 || currentLogIndex >= logs.length - 1}
            aria-label="Next step"
            title="Next step"
          >
            <StepForward className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={restartAnimation}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/70 text-foreground/70 hover:bg-white border border-white/60 transition-all disabled:opacity-40"
            disabled={logs.length === 0}
            aria-label="Restart animation"
            title="Restart animation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <select
            value={speedMs}
            onChange={(event) => setSpeedMs(Number(event.target.value))}
            className="h-8 rounded-lg bg-white/70 border border-white/60 px-2 text-xs font-semibold text-foreground/70 outline-none"
            aria-label="Animation speed"
            title="Animation speed"
          >
            {SPEED_OPTIONS.map((option) => (
              <option key={option.ms} value={option.ms}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="h-6 w-px bg-white/60" />
          <button
            type="button"
            onClick={() => updateZoom(-ZOOM_STEP)}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/70 text-foreground/70 hover:bg-white border border-white/60 transition-all disabled:opacity-40"
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-xs font-semibold text-foreground/70 tabular-nums">
            {zoomPercent}%
          </span>
          <button
            type="button"
            onClick={() => updateZoom(ZOOM_STEP)}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/70 text-foreground/70 hover:bg-white border border-white/60 transition-all disabled:opacity-40"
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/70 text-foreground/70 hover:bg-white border border-white/60 transition-all"
            aria-label="Reset zoom"
            title="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((value) => !value)}
            className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/70 text-foreground/70 hover:bg-white border border-white/60 transition-all"
            aria-label={isFullscreen ? "Exit fullscreen graph" : "Fullscreen graph"}
            title={isFullscreen ? "Exit fullscreen graph" : "Fullscreen graph"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>
      <div className={contentClass}>
        <div className="px-5 py-3 border-b border-white/50 bg-white/30">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-foreground/75">
              Step {Math.max(0, currentLogIndex + 1)} / {logs.length}
            </span>
            <span className="text-muted-foreground truncate max-w-full sm:max-w-[70%]">
              {currentLog ? currentLog.message : "Ready to animate traversal"}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/70 overflow-hidden">
            <div
              className="h-full bg-gradient-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className={graphViewportClass}>
          <svg
            width={w * zoom}
            height={h * zoom}
            viewBox={`0 0 ${w} ${h}`}
            className="block"
          >
            <defs>
              <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="edgeMatch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="nodeMatch" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {eds.map(([a, b], i) => {
              const targetX = a.x === b.x ? b.x + 0.1 : b.x;
              const isChildVisited = visitedNodeIds.has(b.node.nodeId);
              const isChildCurrent = !isAnimationComplete && currentLog?.nodeId === b.node.nodeId;

              return (
                <path
                  key={i}
                  d={`M ${a.x} ${a.y + NODE_H / 2} C ${a.x} ${(a.y + b.y) / 2}, ${targetX} ${(a.y + b.y) / 2}, ${targetX} ${b.y - NODE_H / 2}`}
                  stroke={
                    isChildCurrent
                      ? ACTIVE_COLOR
                      : isChildVisited && b.node.isMatched
                      ? "url(#edgeMatch)"
                      : isChildVisited
                      ? "hsl(var(--primary) / 0.55)"
                      : "url(#edge)"
                  }
                  strokeWidth={isChildCurrent ? 2.5 : isChildVisited ? 2 : 1.5}
                  fill="none"
                />
              );
            })}

            {nodes.map((p) => {
              const isHover = hover === p.node.nodeId;
              const isMatch = p.node.isMatched;
              const isVisited = visitedNodeIds.has(p.node.nodeId);
              const isCurrent = !isAnimationComplete && currentLog?.nodeId === p.node.nodeId;
              const isRevealedMatch = isVisited && isMatch;

              return (
                <g
                  key={p.node.nodeId}
                  transform={`translate(${p.x - NODE_W / 2}, ${p.y - NODE_H / 2})`}
                  onMouseEnter={() => setHover(p.node.nodeId)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                  filter={isRevealedMatch ? "url(#glow)" : undefined}
                >
                  {isCurrent && (
                    <rect
                      x={-5}
                      y={-5}
                      width={NODE_W + 10}
                      height={NODE_H + 10}
                      rx={14}
                      fill={ACTIVE_FILL}
                    />
                  )}
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    className="transition-all duration-200"
                    fill={
                      isCurrent
                        ? ACTIVE_NODE_FILL
                        : isRevealedMatch
                        ? "url(#nodeMatch)"
                        : isVisited
                        ? "hsl(var(--primary-soft) / 0.75)"
                        : "hsl(0 0% 100% / 0.85)"
                    }
                    stroke={
                      isCurrent
                        ? ACTIVE_COLOR
                        : isRevealedMatch
                      ? "transparent"
                      : isHover
                      ? "hsl(var(--primary))"
                      : isVisited
                      ? "hsl(var(--primary) / 0.45)"
                      : "hsl(var(--primary) / 0.25)"
                    }
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                  />
                  <text
                    x={NODE_W / 2}
                    y={NODE_H / 2 + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight={isRevealedMatch || isCurrent ? 700 : 600}
                    fontFamily="Sora, system-ui, sans-serif"
                    fill={isRevealedMatch && !isCurrent ? "white" : "hsl(var(--foreground))"}
                  >
                    &lt;{p.node.tag}&gt;
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );

  return isFullscreen ? createPortal(graphPanel, document.body) : graphPanel;
}
