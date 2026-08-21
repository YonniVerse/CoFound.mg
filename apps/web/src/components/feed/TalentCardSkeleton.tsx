export function TalentCardSkeleton() {
  return (
    <div className="bg-background border border-border rounded-xl p-5 shadow-xs flex flex-col gap-4 animate-pulse">
      {/* Header: Avatar + Name */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-muted shrink-0" />
        <div className="flex flex-col flex-1 pt-1 gap-2">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 rounded-md bg-muted" />
            <div className="h-4 w-10 rounded-full bg-muted" />
          </div>
          <div className="h-3 w-44 rounded bg-muted" />
        </div>
      </div>

      {/* Headline */}
      <div className="h-4 w-3/4 rounded bg-muted" />

      {/* Bio */}
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3.5 w-5/6 rounded bg-muted" />
      </div>

      {/* Skills & Goals section */}
      <div className="flex flex-col gap-3 py-3 border-y border-border/50 mt-1">
        {/* Skills */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="flex flex-wrap gap-1.5">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted" />
            <div className="h-5 w-14 rounded-full bg-muted" />
            <div className="h-5 w-18 rounded-full bg-muted" />
          </div>
        </div>

        {/* Goals */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="flex flex-wrap gap-1.5">
            <div className="h-5 w-24 rounded-full bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted" />
          </div>
        </div>

        {/* Availability */}
        <div className="h-3 w-32 rounded bg-muted" />
      </div>

      {/* CTA */}
      <div className="flex gap-2 mt-auto pt-1 w-full">
        <div className="h-8 flex-1 rounded-lg bg-muted" />
        <div className="h-8 flex-1 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
