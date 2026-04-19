interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="bg-dfs-container/65 border border-dfs/30 rounded-2xl p-5 flex gap-3 shadow-sm">
      <span className="text-dfs text-lg flex-shrink-0">⚠</span>
      <div>
        <p className="text-sm font-semibold text-on-dfs mb-1">Traversal Failed</p>
        <p className="text-xs text-on-dfs font-mono leading-relaxed">{error}</p>
      </div>
    </div>
  );
}
