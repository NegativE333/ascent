"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

import { hoursLabel, type ExamPace } from "@/lib/stats";

type Week = {
  topicsThisWeek: number;
  mcqsThisWeek: number;
  targetTopics: number;
  targetMcqs: number;
  topicsPct: number;
  mcqsPct: number;
};

function StatCell({
  label,
  value,
  hint,
  emphasize,
  compact,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  emphasize?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0 px-3 py-3 sm:px-4">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={`stat-number mt-1 font-semibold tracking-tight ${
          emphasize
            ? "text-3xl sm:text-4xl"
            : compact
              ? "text-base sm:text-lg"
              : "text-2xl"
        }`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function TargetBar({
  label,
  current,
  target,
  pct,
  color,
}: {
  label: string;
  current: number;
  target: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 shrink-0 text-xs text-muted-foreground">{label}</div>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-[3px] bg-track">
        <div
          className="h-full rounded-[3px] transition-[width] duration-200"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="stat-number w-[72px] shrink-0 text-right text-xs text-muted-foreground">
        {current}/{target}
      </div>
    </div>
  );
}

function ProjectionCell({
  label,
  date,
  detail,
  behind,
}: {
  label: string;
  date: string;
  detail: string;
  behind: boolean;
}) {
  return (
    <div className="min-w-0 px-3 py-2.5 sm:px-4">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={`stat-number mt-0.5 text-sm font-medium ${
          behind ? "text-tag-revise-fg" : "text-foreground"
        }`}
      >
        Finish ~{format(parseISO(date), "MMM d, yyyy")}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}

export function MotivationOverview({
  streak,
  longest,
  pace,
  week,
}: {
  streak: number;
  longest: number;
  pace: ExamPace;
  week: Week;
}) {
  const daysLeft =
    pace.daysLeft != null ? Math.max(0, pace.daysLeft) : null;

  const paceTitle =
    pace.status === "no_exam"
      ? "Set exam date"
      : pace.status === "done"
        ? "Syllabus done"
        : pace.status === "on_pace"
          ? "On pace"
          : pace.status === "ahead"
            ? "Ahead"
            : pace.status === "behind"
              ? "Behind"
              : "Building pace";

  const habits = pace.atCurrentHabits;
  const paceHint =
    pace.status === "no_exam"
      ? "Not set"
      : pace.status === "no_data"
        ? "Need more practice data"
        : habits
          ? habits.status === "on_pace"
            ? `Finish ~${format(parseISO(habits.projectedDate), "MMM d")}`
            : `${Math.abs(habits.daysDelta)} days ${habits.status}`
          : "Keep going";

  return (
    <section className="panel overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border sm:grid-cols-4">
        <StatCell
          label="Current streak"
          emphasize
          value={
            <motion.span
              key={streak}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {streak}
            </motion.span>
          }
          hint="days"
        />
        <StatCell label="Longest streak" emphasize value={longest} hint="days" />
        <StatCell
          label="Days to exam"
          value={daysLeft ?? "—"}
          hint={daysLeft == null ? "Not set" : undefined}
        />
        <StatCell label="Pace" compact value={paceTitle} hint={paceHint} />
      </div>

      {pace.status === "no_exam" && (
        <div className="border-b border-border px-4 py-2.5 text-xs text-muted-foreground">
          Set your exam date in settings to unlock countdown and pace.{" "}
          <Link href="/settings" className="text-foreground underline">
            Open settings
          </Link>
        </div>
      )}

      {pace.remainingTopics > 0 && (
        <div className="border-b border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span className="text-foreground">
            {hoursLabel(pace.remainingMinutes)}
          </span>{" "}
          of study left across {pace.remainingTopics} topics
        </div>
      )}

      {pace.atCurrentHabits && pace.ifDaily && (
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <ProjectionCell
            label="At current habits"
            date={pace.atCurrentHabits.projectedDate}
            detail={`${pace.atCurrentHabits.hoursPerWeek}h/week · ${pace.studyDaysPerWeek} study days/week`}
            behind={pace.atCurrentHabits.status === "behind"}
          />
          <ProjectionCell
            label="If you study daily"
            date={pace.ifDaily.projectedDate}
            detail={`${pace.ifDaily.hoursPerWeek}h/week`}
            behind={pace.ifDaily.status === "behind"}
          />
        </div>
      )}

      <div className="space-y-2.5 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">This week</p>
          <p className="text-[11px] text-muted-foreground">
            {week.topicsThisWeek} topics · {week.mcqsThisWeek} MCQs done
          </p>
        </div>
        <TargetBar
          label="Topics"
          current={week.topicsThisWeek}
          target={week.targetTopics}
          pct={week.topicsPct}
          color="var(--primary)"
        />
        <TargetBar
          label="MCQs"
          current={week.mcqsThisWeek}
          target={week.targetMcqs}
          pct={week.mcqsPct}
          color="var(--success)"
        />
      </div>
    </section>
  );
}
