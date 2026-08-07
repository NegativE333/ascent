"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { hoursLabel, type WeeklyReview } from "@/lib/stats";
import { SUBJECT_COLORS } from "@/lib/types";

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return null;
  const diff = current - previous;
  if (diff === 0) {
    return <span className="text-[11px] text-muted-foreground">same as last week</span>;
  }
  return (
    <span
      className={`text-[11px] ${diff > 0 ? "text-success" : "text-tag-revise-fg"}`}
    >
      {diff > 0 ? "+" : ""}
      {diff} vs last week
    </span>
  );
}

function Stat({
  label,
  value,
  current,
  previous,
}: {
  label: string;
  value: string;
  current: number;
  previous: number;
}) {
  return (
    <div className="min-w-0 px-3 py-3 sm:px-4">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="stat-number mt-1 text-2xl font-semibold tracking-tight">
        {value}
      </p>
      <div className="mt-0.5">
        <Delta current={current} previous={previous} />
      </div>
    </div>
  );
}

export function WeeklyReviewPanel({ review }: { review: WeeklyReview }) {
  const { current, previous } = review;
  const hoursDone = current.minutes / 60;
  const onTrack =
    review.hoursNeededPerWeek === 0 || hoursDone >= review.hoursNeededPerWeek;

  return (
    <div className="space-y-6">
      <div className="panel overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border sm:grid-cols-4">
          <Stat
            label="Days studied"
            value={`${current.daysStudied}/7`}
            current={current.daysStudied}
            previous={previous.daysStudied}
          />
          <Stat
            label="Time studied"
            value={hoursLabel(current.minutes)}
            current={Math.round(current.minutes / 60)}
            previous={Math.round(previous.minutes / 60)}
          />
          <Stat
            label="Questions"
            value={String(current.questions)}
            current={current.questions}
            previous={previous.questions}
          />
          <Stat
            label="Accuracy"
            value={`${current.accuracy}%`}
            current={current.accuracy}
            previous={previous.accuracy}
          />
        </div>

        <div className="px-4 py-3 text-sm">
          {onTrack ? (
            <p className="text-success">
              You put in {hoursLabel(current.minutes)} this week, at or above the{" "}
              {review.hoursNeededPerWeek}h needed to finish before your exam.
            </p>
          ) : (
            <p className="text-muted-foreground">
              You studied{" "}
              <span className="text-foreground">
                {hoursLabel(current.minutes)}
              </span>{" "}
              against the{" "}
              <span className="text-foreground">
                {review.hoursNeededPerWeek}h
              </span>{" "}
              a week needed to finish before your exam.{" "}
              <Link href="/settings" className="underline hover:text-foreground">
                Adjust targets
              </Link>
            </p>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold">What you closed out</h2>
        <div className="panel divide-y divide-border">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-sm">Topics completed</span>
            <span className="stat-number text-sm">{review.topicsCompleted}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-sm">Revisions logged</span>
            <span className="stat-number text-sm">{review.revisions}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-sm">Mock tests taken</span>
            <span className="stat-number text-sm">{current.mocks}</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Time by subject</h2>
        <div className="panel divide-y divide-border">
          {review.subjectMinutes.map((s) => (
            <div
              key={s.slug}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: SUBJECT_COLORS[s.slug] ?? "var(--primary)",
                }}
              />
              <span className="min-w-0 flex-1 truncate text-sm">{s.name}</span>
              <span className="stat-number text-sm text-muted-foreground">
                {s.minutes === 0 ? "—" : hoursLabel(s.minutes)}
              </span>
            </div>
          ))}
        </div>
        {review.neglected.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            No time at all on{" "}
            <span className="text-foreground">
              {review.neglected.map((s) => s.name).join(", ")}
            </span>{" "}
            this week. Worth putting one block in next week before the gap grows.
          </p>
        )}
      </section>

      <p className="text-[11px] text-muted-foreground">
        Week of {format(parseISO(review.weekStart), "MMM d")} –{" "}
        {format(parseISO(review.weekEnd), "MMM d")}
      </p>
    </div>
  );
}
