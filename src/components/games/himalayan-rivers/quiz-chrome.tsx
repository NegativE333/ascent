"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type RecapItem = {
  id: string;
  prompt: string;
  correct: boolean;
  detail?: string;
};

export function QuizStats({
  score,
  streak,
  bestStreak,
}: {
  score: number;
  streak: number;
  bestStreak: number;
}) {
  return (
    <div className="flex gap-4 text-sm tabular-nums">
      <Stat label="Score" value={`${score}`} />
      <Stat label="Streak" value={`${streak}`} />
      <Stat label="Best" value={`${bestStreak}`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="stat-number text-base font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

export function QuizProgressHeader({
  questionLabel,
  title,
  subtitle,
  score,
  streak,
  bestStreak,
  progress,
}: {
  questionLabel: string;
  title: string;
  subtitle?: string;
  score: number;
  streak: number;
  bestStreak: number;
  progress: number;
}) {
  return (
    <div className="panel space-y-3 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label">{questionLabel}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <QuizStats score={score} streak={streak} bestStreak={bestStreak} />
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/70 transition-[width] duration-300 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

export function AnswerFeedback({
  correct,
  title,
  body,
  nextLabel,
  onNext,
}: {
  correct: boolean;
  title: string;
  body?: string;
  nextLabel: string;
  onNext: () => void;
}) {
  return (
    <div className="panel space-y-3 p-4">
      <div className="flex items-center gap-2">
        {correct ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <Check className="size-4" /> Correct
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
            <X className="size-4" /> Incorrect
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {body ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {body}
          </p>
        ) : null}
      </div>
      <Button type="button" className="w-full" onClick={onNext}>
        {nextLabel}
      </Button>
    </div>
  );
}

export function QuizResults({
  score,
  total,
  bestStreak,
  recap,
  onPlayAgain,
  playAgainLabel = "Play again",
}: {
  score: number;
  total: number;
  bestStreak: number;
  recap: RecapItem[];
  onPlayAgain: () => void;
  playAgainLabel?: string;
}) {
  const accuracy = total ? Math.round((score / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="panel space-y-4 p-5 text-center sm:p-6">
        <p className="section-label">Round complete</p>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {score}/{total}
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Accuracy</p>
            <p className="stat-number font-semibold">{accuracy}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Best streak</p>
            <p className="stat-number font-semibold">{bestStreak}</p>
          </div>
        </div>
        <Button type="button" onClick={onPlayAgain} className="gap-2">
          <RotateCcw className="size-4" />
          {playAgainLabel}
        </Button>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-border px-4 py-2.5">
          <p className="section-label">Recap</p>
        </div>
        <ul className="divide-y divide-border">
          {recap.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 px-4 py-2.5 text-sm"
            >
              {item.correct ? (
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <X className="mt-0.5 size-4 shrink-0 text-red-500" />
              )}
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.prompt}</p>
                {item.detail ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
