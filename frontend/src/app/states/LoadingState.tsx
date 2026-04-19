export default function LoadingState() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm p-20 flex flex-col items-center gap-5">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-outline-variant/30" />
        <div className="absolute inset-0 rounded-full border-2 border-t-bfs animate-spin" />
        <div
          className="absolute inset-2 rounded-full border-2 border-b-dfs animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "0.75s" }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-on-surface">Traversing DOM…</p>
        <p className="text-xs text-on-surface-variant mt-1">Parsing and searching the document tree</p>
      </div>
    </div>
  );
}
