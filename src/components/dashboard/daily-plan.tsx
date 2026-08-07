import Link from "next/link";
import { Check } from "lucide-react";
import type { DailyPlanItem } from "@/lib/stats";
import { hoursLabel } from "@/lib/stats";

const KIND_LABELS: Record<DailyPlanItem["kind"], string> = {
  revise: "Revise",
  study: "Learn",
  practice: "Practice",
};

export function DailyPlan({
  items,
  doneCount,
  minutes,
}: {
  items: DailyPlanItem[];
  doneCount: number;
  minutes: number;
}) {
  const allDone = items.length > 0 && doneCount === items.length;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Today&apos;s plan</h2>
        <span className="text-xs text-muted-foreground">
          {doneCount}/{items.length} done · ~{hoursLabel(minutes)}
        </span>
      </div>

      {allDone ? (
        <div className="panel flex items-center gap-2 px-3 py-3">
          <span className="flex size-5 items-center justify-center rounded-full bg-success/15">
            <Check className="size-3 text-success" />
          </span>
          <p className="text-sm">
            Done for today. Anything more is a bonus.
          </p>
        </div>
      ) : (
        <ul className="panel divide-y divide-border overflow-hidden">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href ?? "/syllabus"}
                className="flex items-center gap-3 px-3 py-2.5 row-hover"
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border ${
                    item.done
                      ? "border-success bg-success/15"
                      : "border-border bg-background"
                  }`}
                >
                  {item.done && <Check className="size-2.5 text-success" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm ${
                      item.done
                        ? "text-muted-foreground line-through"
                        : "font-medium"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {KIND_LABELS[item.kind]} · {item.detail}
                  </p>
                </div>
                <span className="stat-number shrink-0 text-[11px] text-muted-foreground">
                  {item.minutes}m
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
