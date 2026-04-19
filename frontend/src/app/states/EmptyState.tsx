import { Eye, MemoryStick, Network, Timer } from "lucide-react";

export default function EmptyState() {
  return (
    <section className="flex-grow bg-surface-container-low rounded-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 border-l border-t border-primary/40" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border-r border-b border-primary/40" />
      </div>

      <div className="max-w-md w-full px-8 text-center space-y-8 relative z-10">
        <div className="relative inline-block">
          <div className="w-32 h-32 mx-auto bg-surface-container-highest rounded-full flex items-center justify-center relative">
            <Network className="h-14 w-14 text-outline-variant" strokeWidth={2.2} aria-hidden="true" />
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-primary-fixed text-on-primary-fixed-variant rounded-full flex items-center justify-center shadow-md">
              <Eye className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
            </div>
          </div>

          <svg className="absolute -inset-12 w-56 h-56 opacity-10 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeDasharray="2 4" />
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" />
          </svg>
        </div>

        <div className="space-y-3">
          <h3 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Observatorium Siap</h3>
          <p className="text-on-surface-variant leading-relaxed">
            Masukkan URL atau HTML di panel kontrol untuk memulai observasi struktur DOM. Visualisasi akan muncul dalam model skema teknis.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <div className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg text-xs font-mono font-bold">
            STATUS: IDLE
          </div>
          <div className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg text-xs font-mono font-bold">
            LATENCY: 0ms
          </div>
          <div className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg text-xs font-mono font-bold">
            NODES: 0
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 h-12 bg-surface-container-lowest/80 backdrop-blur-md rounded-xl flex items-center justify-between px-6 border border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface">Siap Memulai</span>
          </div>
          <div className="h-4 w-px bg-outline-variant/30" />
          <span className="font-mono text-[11px] text-on-surface-variant">Menunggu input observasi...</span>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <MemoryStick className="h-3.5 w-3.5 text-outline" strokeWidth={2.2} aria-hidden="true" />
            <span className="font-mono text-[11px] font-bold text-on-surface">MEMORY: 0.0 MB</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-3.5 w-3.5 text-outline" strokeWidth={2.2} aria-hidden="true" />
            <span className="font-mono text-[11px] font-bold text-on-surface">TIME: 0.0s</span>
          </div>
        </div>
      </div>
    </section>
  );
}


