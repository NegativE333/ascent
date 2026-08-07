"use client";

import { TIER1_TOTAL_MARKS, type ScoreProjection } from "@/lib/stats";
import { SUBJECT_COLORS } from "@/lib/types";

const CONFIDENCE_NOTE: Record<ScoreProjection["confidence"], string> = {
  low: "Rough guess — log a mock with sectional marks to sharpen it.",
  medium: "Reasonable estimate. Three mocks with sectional marks makes it solid.",
  high: "Based on your recent mocks.",
};

const BASIS_LABEL: Record<string, string> = {
  mocks: "from mocks",
  practice: "from practice",
  none: "no data",
};

export function ScoreProjectionPanel({
  projection,
}: {
  projection: ScoreProjection;
}) {
  const { expected, target, gap, sections, bestLeverage, confidence } =
    projection;
  const pct = Math.min(100, Math.round((expected / TIER1_TOTAL_MARKS) * 100));
  const targetPct = Math.min(
    100,
    Math.round((target / TIER1_TOTAL_MARKS) * 100)
  );

  return (
    <div className="space-y-4">
      <div className="panel px-4 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground">
              Expected Tier 1 score
            </p>
            <p className="stat-number mt-0.5 text-3xl font-semibold tracking-tight">
              {expected}
              <span className="text-base font-normal text-muted-foreground">
                /{TIER1_TOTAL_MARKS}
              </span>
            </p>
          </div>
          <p
            className={`text-sm ${gap > 0 ? "text-tag-revise-fg" : "text-success"}`}
          >
            {gap > 0
              ? `${gap} marks short of your ${target} target`
              : `${Math.abs(gap)} marks above your ${target} target`}
          </p>
        </div>

        <div className="relative mt-3 h-2 overflow-hidden rounded-[3px] bg-track">
          <div
            className="h-full rounded-[3px]"
            style={{ width: `${pct}%`, backgroundColor: "var(--primary)" }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground/50"
            style={{ left: `${targetPct}%` }}
            title={`Target ${target}`}
          />
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          {CONFIDENCE_NOTE[confidence]}
        </p>
      </div>

      {bestLeverage && bestLeverage.marksPerHour !== null && (
        <p className="text-sm text-muted-foreground">
          Best return on study time is{" "}
          <span className="font-medium text-foreground">
            {bestLeverage.label}
          </span>
          . Covering its remaining {bestLeverage.remainingHours}h would add
          about {bestLeverage.gain} marks at your current accuracy, roughly{" "}
          {bestLeverage.marksPerHour} marks per study hour.
        </p>
      )}

      <div className="panel overflow-hidden">
        <div className="table-head hidden border-b border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1.2fr)_repeat(4,auto)] sm:gap-3">
          <span>Section</span>
          <span className="text-right">Expected</span>
          <span className="text-right">Accuracy</span>
          <span className="text-right">Attempt</span>
          <span className="text-right">Marks/hour</span>
        </div>
        {sections.map((section) => {
          const color = SUBJECT_COLORS[section.slug] ?? "var(--primary)";
          return (
            <div
              key={section.slug}
              className="grid grid-cols-2 gap-2 border-b border-border px-3 py-2.5 last:border-0 row-hover sm:grid-cols-[minmax(0,1.2fr)_repeat(4,auto)] sm:gap-3"
            >
              <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate text-sm font-medium">
                  {section.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {BASIS_LABEL[section.basis]}
                </span>
              </div>
              <span className="stat-number text-sm sm:text-right">
                {section.expectedMarks}/50
              </span>
              <span className="stat-number text-sm text-muted-foreground sm:text-right">
                {section.accuracy}%
              </span>
              <span className="stat-number text-sm text-muted-foreground sm:text-right">
                {section.attemptRate}%
              </span>
              <span className="stat-number text-sm text-muted-foreground sm:text-right">
                {section.marksPerHour ?? "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
