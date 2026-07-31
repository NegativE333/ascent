"use client";

import { SUBJECT_COLORS, type Subject } from "@/lib/types";

export function SubjectProgress({
  items,
}: {
  items: {
    subject: Subject;
    percent: number;
    done: number;
    total: number;
  }[];
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const color = SUBJECT_COLORS[item.subject.slug] ?? "var(--primary)";
        return (
          <div key={item.subject.id}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-sm text-foreground">{item.subject.name}</p>
              <p className="stat-number text-xs text-muted-foreground">
                {item.done}/{item.total} · {item.percent}%
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-[2px] bg-track">
              <div
                className="h-full rounded-[2px] transition-[width] duration-200"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
