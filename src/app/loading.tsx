export default function Loading() {
  return (
    <div className="fixed inset-0 z-40 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          <span>CALIBRATING WAYPOINT...</span>
        </div>
      </div>
    </div>
  );
}
