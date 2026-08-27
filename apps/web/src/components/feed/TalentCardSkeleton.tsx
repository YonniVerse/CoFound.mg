export function TalentCardSkeleton() {
  return (
    <div className="group flex min-w-0 flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-5 shadow-2xs animate-pulse sm:p-6">
      {/* Header: neutral avatar + anonymous identity + protected identity */}
      <header className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
          <div className="min-w-0 space-y-1.5">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-3 w-36 rounded bg-muted" />
          </div>
        </div>
        <div className="flex max-w-[52%] shrink-0 items-start gap-1">
          <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full bg-muted" />
          <div className="h-3.5 w-28 rounded bg-muted" />
        </div>
      </header>

      {/* Headline */}
      <div className="h-4 w-3/4 rounded bg-muted" />

      {/* Category & skills */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
        <div className="h-3.5 w-20 rounded bg-muted" />
        <div className="h-6 w-24 rounded-md bg-muted" />
        <div className="h-3.5 w-1 rounded bg-muted" />
        <div className="h-3.5 w-20 rounded bg-muted" />
        <div className="h-6 w-16 rounded-md bg-muted" />
        <div className="h-6 w-20 rounded-md bg-muted" />
        <div className="h-6 w-14 rounded-md bg-muted" />
      </div>

      {/* Goals */}
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-20 rounded-md bg-muted" />
        <div className="h-6 w-28 rounded-md bg-muted" />
      </div>

      {/* Availability & actions */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
        <div className="h-3.5 w-28 rounded bg-muted" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-8 w-20 rounded-lg bg-muted" />
          <div className="h-8 w-20 rounded-lg bg-muted" />
          <div className="h-9 w-36 rounded-lg bg-muted" />
        </div>
      </footer>
    </div>
  );
}

export default TalentCardSkeleton;
