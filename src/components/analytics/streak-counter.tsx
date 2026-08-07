export function StreakCounter({
  current,
  longest,
  totalDays,
}: {
  current: number;
  longest: number;
  totalDays: number;
}) {
  return (
    <div className="flex items-stretch border-y border-border">
      <div className="flex-1 px-4 py-4">
        <p className="stat-number text-2xl font-semibold">{current}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Day streak
          {longest > 0
            ? ` · longest ${longest} day${longest === 1 ? "" : "s"}`
            : ""}
        </p>
      </div>
      <div className="flex-1 border-l border-border px-4 py-4">
        <p className="stat-number text-2xl font-semibold">{totalDays}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Total days studied
        </p>
      </div>
    </div>
  );
}
