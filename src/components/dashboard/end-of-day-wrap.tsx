"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { hoursLabel, type DailyPlanItem, type EndOfDayWrap } from "@/lib/stats";

/** Local hour after which the wrap appears. */
const EOD_HOUR = 18;

const KIND_LABELS: Record<DailyPlanItem["kind"], string> = {
  revise: "Revise",
  study: "Learn",
  practice: "Practice",
};

function dismissKey(date: string) {
  return `ascent.eod-dismissed.${date}`;
}

export function EndOfDayWrap({ wrap }: { wrap: EndOfDayWrap }) {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");
    const evening = now.getHours() >= EOD_HOUR;
    const dismissed = window.localStorage.getItem(dismissKey(today)) === "1";
    setShow(evening && !dismissed);
    setReady(true);
  }, []);

  if (!ready || !show) return null;
  if (wrap.slipped.length === 0 && !wrap.allDone) return null;

  function dismiss() {
    const today = format(new Date(), "yyyy-MM-dd");
    window.localStorage.setItem(dismissKey(today), "1");
    setShow(false);
  }

  if (wrap.allDone) {
    return (
      <section className="panel flex items-start gap-3 px-3 py-3">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15">
          <Check className="size-3 text-success" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Evening wrap</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Today&apos;s plan is clear. Rest — tomorrow&apos;s list will be ready
            in the morning.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </section>
    );
  }

  const first = wrap.slipped[0];

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-start gap-3 border-b border-border px-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Evening wrap</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {wrap.slipped.length === 1
              ? "One thing still open"
              : `${wrap.slipped.length} things still open`}{" "}
            · ~{hoursLabel(wrap.remainingMinutes)} left. Even finishing one keeps
            the day from going empty.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <ul className="divide-y divide-border">
        {wrap.slipped.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href ?? "/syllabus"}
              className="flex items-center gap-3 px-3 py-2.5 row-hover"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
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

      {first && (
        <div className="border-t border-border px-3 py-2.5">
          <Link
            href={first.href ?? "/syllabus"}
            className="text-xs font-medium text-primary hover:underline"
          >
            Start with {first.title.replace(/^(Revise|Study|Practice)\s+/i, "")}
          </Link>
        </div>
      )}
    </section>
  );
}
