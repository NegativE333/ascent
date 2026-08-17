"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PANCH_PRAYAG } from "@/lib/games/himalayan-rivers/hotspots";
import { cn } from "@/lib/utils";

type Props = {
  onComplete: (correct: boolean) => void;
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Zoomed-in style panel: order the five Prayags upstream → downstream.
 * (Too close together on the national map to click individually.)
 */
export function PrayagOrderPanel({ onComplete }: Props) {
  const options = useMemo(() => shuffle([...PANCH_PRAYAG]), []);
  const [order, setOrder] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    if (submitted) return;
    setOrder((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const submit = () => {
    if (order.length !== 5) return;
    setSubmitted(true);
  };

  const correct =
    submitted &&
    order.every((id, i) => id === PANCH_PRAYAG[i]?.id);

  return (
    <div className="panel space-y-4 p-4 sm:p-5">
      <div>
        <p className="section-label">Panch Prayag</p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Tap in order from upstream to downstream. The last confluence forms
          the Ganga.
        </p>
      </div>

      {/* Schematic “zoom” strip */}
      <div className="rounded-md border border-border bg-muted/40 px-3 py-4">
        <div className="flex items-center justify-between gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          <span>Upstream</span>
          <span className="h-px flex-1 bg-border mx-2" />
          <span>Downstream</span>
        </div>
        <ol className="mt-3 grid grid-cols-5 gap-1.5">
          {Array.from({ length: 5 }, (_, i) => {
            const id = order[i];
            const item = PANCH_PRAYAG.find((p) => p.id === id);
            return (
              <li
                key={i}
                className={cn(
                  "flex min-h-[64px] flex-col items-center justify-center rounded-md border px-1 py-2 text-center",
                  item
                    ? "border-foreground/20 bg-card"
                    : "border-dashed border-border bg-transparent"
                )}
              >
                <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                <span className="mt-0.5 text-[11px] font-medium leading-tight">
                  {item?.name ?? "—"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <ul className="space-y-2">
        {options.map((p) => {
          const selected = order.includes(p.id);
          const position = selected ? order.indexOf(p.id) + 1 : null;
          return (
            <li key={p.id}>
              <button
                type="button"
                disabled={submitted}
                onClick={() => toggle(p.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                  selected
                    ? "border-foreground/25 bg-foreground/5"
                    : "border-border hover:bg-surface-hover",
                  submitted && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] tabular-nums",
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {position ?? ""}
                </span>
                <span>
                  <span className="font-medium">{p.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {p.detail}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {!submitted ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setOrder([])}
            disabled={order.length === 0}
          >
            Clear
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={submit}
            disabled={order.length !== 5}
          >
            Check order
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            {correct ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <Check className="size-4" /> Correct order
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <X className="size-4" /> Not quite
              </span>
            )}
          </div>
          {!correct && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Correct:{" "}
              {PANCH_PRAYAG.map((p) => p.name).join(" → ")}
            </p>
          )}
          <Button
            type="button"
            className="w-full"
            onClick={() => onComplete(Boolean(correct))}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
