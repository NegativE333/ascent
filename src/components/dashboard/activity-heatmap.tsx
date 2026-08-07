"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { buildHeatmap, hoursLabel } from "@/lib/stats";
import type { McqSession, StudySession } from "@/lib/types";

function levelClass(count: number) {
  if (count === 0) return "bg-heatmap-0";
  if (count === 1) return "bg-heatmap-1";
  if (count === 2) return "bg-heatmap-2";
  if (count <= 4) return "bg-heatmap-3";
  return "bg-heatmap-4";
}

function cellLabel(cell: {
  date: string;
  count: number;
  questions: number;
  studyMinutes: number;
}) {
  const date = format(parseISO(cell.date), "EEE, MMM d, yyyy");
  if (cell.count === 0) return { date, detail: "No activity" };

  const parts: string[] = [];
  if (cell.questions > 0) {
    parts.push(
      `${cell.questions} question${cell.questions === 1 ? "" : "s"}`
    );
  }
  if (cell.studyMinutes > 0) {
    parts.push(`${hoursLabel(cell.studyMinutes)} studied`);
  }
  if (parts.length === 0) {
    parts.push(
      `${cell.count} session${cell.count === 1 ? "" : "s"}`
    );
  }
  return { date, detail: parts.join(" · ") };
}

export function ActivityHeatmap({
  sessions,
  study = [],
}: {
  sessions: McqSession[];
  study?: StudySession[];
}) {
  const cells = buildHeatmap(sessions, 119, study);
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const [hover, setHover] = useState<{
    date: string;
    count: number;
    questions: number;
    studyMinutes: number;
    x: number;
    y: number;
  } | null>(null);

  const tip = hover ? cellLabel(hover) : null;

  return (
    <div className="relative w-full">
      <div className="flex w-full gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex min-w-0 flex-1 flex-col gap-[3px]">
            {week.map((cell) => (
              <button
                key={cell.date}
                type="button"
                aria-label={`${cellLabel(cell).date}: ${cellLabel(cell).detail}`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const parent = e.currentTarget.closest(".relative");
                  const parentRect = parent?.getBoundingClientRect();
                  setHover({
                    ...cell,
                    x: rect.left - (parentRect?.left ?? 0) + rect.width / 2,
                    y: rect.top - (parentRect?.top ?? 0),
                  });
                }}
                onMouseLeave={() => setHover(null)}
                onFocus={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const parent = e.currentTarget.closest(".relative");
                  const parentRect = parent?.getBoundingClientRect();
                  setHover({
                    ...cell,
                    x: rect.left - (parentRect?.left ?? 0) + rect.width / 2,
                    y: rect.top - (parentRect?.top ?? 0),
                  });
                }}
                onBlur={() => setHover(null)}
                className={cn(
                  "aspect-square w-full rounded-[2px] outline-none transition-opacity duration-150 hover:opacity-80 focus-visible:ring-1 focus-visible:ring-foreground/30",
                  levelClass(cell.count)
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {hover && tip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-2.5 py-1.5 text-left shadow-sm"
          style={{
            left: hover.x,
            top: hover.y - 8,
          }}
        >
          <p className="whitespace-nowrap text-xs font-medium text-foreground">
            {tip.date}
          </p>
          <p className="whitespace-nowrap text-[11px] text-muted-foreground">
            {tip.detail}
          </p>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 5].map((n) => (
          <span
            key={n}
            className={cn("size-2.5 rounded-[2px]", levelClass(n))}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
