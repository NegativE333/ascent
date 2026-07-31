export function StreakCounter({
  current,
  longest,
}: {
  current: number;
  longest: number;
}) {
  return (
    <div className="flex items-stretch border-y border-border">
      <div className="flex-1 px-4 py-4">
        <p className="stat-number text-2xl font-semibold">{current}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Day streak</p>
      </div>
      <div className="flex-1 border-l border-border px-4 py-4">
        <p className="stat-number text-2xl font-semibold text-muted-foreground">
          {longest}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Best streak</p>
      </div>
    </div>
  );
}
