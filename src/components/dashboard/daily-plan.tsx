"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { logStudySession, markTopicRevised } from "@/lib/actions";
import type { DailyPlanItem } from "@/lib/stats";
import { hoursLabel } from "@/lib/stats";

const KIND_LABELS: Record<DailyPlanItem["kind"], string> = {
  revise: "Revise",
  study: "Learn",
  practice: "Practice",
};

function topicIdFromItem(item: DailyPlanItem): string | null {
  const match = item.id.match(/^(?:carryover-)?(?:revise|study)-(.+)$/);
  return match?.[1] ?? null;
}

function storageKey(day: string) {
  return `ascent.plan-done.${day}`;
}

function readLocalDone(day: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(storageKey(day));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeLocalDone(day: string, ids: Set<string>) {
  window.localStorage.setItem(storageKey(day), JSON.stringify([...ids]));
}

export function DailyPlan({
  items,
  minutes,
}: {
  items: DailyPlanItem[];
  doneCount: number;
  minutes: number;
}) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [, startTransition] = useTransition();
  const [localDone, setLocalDone] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalDone(readLocalDone(today));
  }, [today]);

  // Once the server confirms an item, drop the sticky local check
  useEffect(() => {
    const confirmed = items.filter((i) => i.done).map((i) => i.id);
    if (confirmed.length === 0) return;
    setLocalDone((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of confirmed) {
        if (next.delete(id)) changed = true;
      }
      if (changed) writeLocalDone(today, next);
      return changed ? next : prev;
    });
  }, [items, today]);

  const visible = items.map((item) => ({
    ...item,
    done: item.done || localDone.has(item.id),
  }));
  const completed = visible.filter((i) => i.done).length;
  const allDone = visible.length > 0 && completed === visible.length;

  function complete(item: DailyPlanItem) {
    if (item.done || localDone.has(item.id) || pendingId) return;

    if (item.kind === "practice") {
      toast.message("Log questions on a topic to clear practice", {
        description: "Open any topic and use Log — counts toward today’s goal.",
      });
      return;
    }

    const topicId = topicIdFromItem(item);
    if (!topicId) {
      toast.error("Could not find that topic");
      return;
    }

    setPendingId(item.id);
    setLocalDone((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      writeLocalDone(today, next);
      return next;
    });

    startTransition(async () => {
      try {
        if (item.kind === "revise") {
          await markTopicRevised(topicId, "good");
          toast.success("Revision logged");
        } else {
          await logStudySession({
            topicId,
            minutes: Math.max(1, item.minutes),
            source: "plan",
            sessionDate: today,
          });
          toast.success(`Logged ${item.minutes}m of study`);
        }
      } catch (err) {
        setLocalDone((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          writeLocalDone(today, next);
          return next;
        });
        toast.error(err instanceof Error ? err.message : "Could not update");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Today&apos;s plan</h2>
        <span className="text-xs text-muted-foreground">
          {completed}/{visible.length} done · ~{hoursLabel(minutes)}
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
          {visible.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 px-3 py-2.5 row-hover"
            >
              <button
                type="button"
                disabled={item.done || pendingId === item.id}
                aria-label={
                  item.done ? "Completed" : `Mark ${item.title} complete`
                }
                onClick={() => complete(item)}
                className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                  item.done
                    ? "border-success bg-success/15"
                    : "border-border bg-background hover:border-foreground/40"
                }`}
              >
                {item.done && <Check className="size-2.5 text-success" />}
              </button>

              <Link
                href={item.href ?? "/syllabus"}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p
                      className={`truncate text-sm ${
                        item.done
                          ? "text-muted-foreground line-through"
                          : "font-medium"
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.carryover && !item.done && (
                      <span className="shrink-0 rounded-[3px] bg-tag-revise-bg px-1.5 py-0.5 text-[10px] font-medium text-tag-revise-fg">
                        Yesterday
                      </span>
                    )}
                  </div>
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
