export function TalentCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-2xs flex flex-col gap-3.5 animate-pulse">
      {/* Header: Avatar + Pseudonym + Field & Cohort + Completion */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-muted shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-40 rounded bg-muted" />
          </div>
        </div>
        <div className="h-5 w-20 rounded bg-muted" />
      </div>

      {/* Headline & Bio */}
      <div className="space-y-1.5">
        <div className="h-3.5 w-48 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>

      {/* Skills & Goals Tags */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <div className="h-5 w-16 rounded-md bg-muted" />
        <div className="h-5 w-20 rounded-md bg-muted" />
        <div className="h-5 w-14 rounded-md bg-muted" />
        <div className="h-5 w-24 rounded-md bg-muted" />
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-1">
        <div className="h-3.5 w-20 rounded bg-muted" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-lg bg-muted" />
          <div className="h-8 w-24 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
