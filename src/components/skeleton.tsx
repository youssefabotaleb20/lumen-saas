export function PageSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">{label}</span>
      <div className="h-9 w-64 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
    </div>
  );
}
