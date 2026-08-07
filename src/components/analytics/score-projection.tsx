"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateUserSettings } from "@/lib/actions";
import { TIER1_TOTAL_MARKS, type ScoreProjection } from "@/lib/stats";
import {
  SUBJECT_COLORS,
  TIER1_CUTOFFS,
  type CutoffCategory,
} from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const [pending, startTransition] = useTransition();
  const {
    expected,
    target,
    gap,
    cutoffCategory,
    cutoffs,
    sections,
    bestLeverage,
    confidence,
  } = projection;

  const pct = Math.min(100, Math.round((expected / TIER1_TOTAL_MARKS) * 100));
  const targetPct = Math.min(
    100,
    Math.round((target / TIER1_TOTAL_MARKS) * 100)
  );

  function selectCutoff(id: CutoffCategory) {
    const preset = TIER1_CUTOFFS.find((c) => c.id === id);
    if (!preset) return;
    startTransition(async () => {
      try {
        await updateUserSettings({
          cutoffCategory: id,
          targetScore: preset.score,
        });
        toast.success(`Target set to ${preset.label} (~${preset.score})`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

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
              ? `${gap} marks short of ${target}`
              : `${Math.abs(gap)} marks above ${target}`}
          </p>
        </div>

        <div className="relative mt-3 h-2 overflow-hidden rounded-[3px] bg-track">
          <div
            className="h-full rounded-[3px]"
            style={{ width: `${pct}%`, backgroundColor: "var(--primary)" }}
          />
          {cutoffs.map((c) => {
            const left = Math.min(
              100,
              Math.round((c.score / TIER1_TOTAL_MARKS) * 100)
            );
            const active = cutoffCategory === c.id;
            return (
              <div
                key={c.id}
                className={cn(
                  "absolute top-0 h-full w-px",
                  active ? "bg-foreground" : "bg-foreground/25"
                )}
                style={{ left: `${left}%` }}
                title={`${c.label} ~${c.score}`}
              />
            );
          })}
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground"
            style={{ left: `${targetPct}%` }}
            title={`Target ${target}`}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {cutoffs.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={pending}
              onClick={() => selectCutoff(c.id)}
              className={cn(
                "rounded-[4px] px-2 py-1 text-[11px] font-medium transition-colors",
                cutoffCategory === c.id
                  ? "bg-foreground text-background"
                  : "bg-surface-hover text-muted-foreground hover:text-foreground"
              )}
            >
              {c.label} · {c.score}
            </button>
          ))}
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          Planning cutoffs only — real cutoffs vary by year and post.{" "}
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
