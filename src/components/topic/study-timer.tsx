"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Pause, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { logStudySession } from "@/lib/actions";
import { Button } from "@/components/ui/button";

type TimerState = {
  topicId: string;
  /** Epoch ms when the current run started, or null while paused. */
  startedAt: number | null;
  /** Seconds banked from previous runs. */
  elapsed: number;
};

const STORAGE_KEY = "ascent.study-timer";

function read(): TimerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TimerState) : null;
  } catch {
    return null;
  }
}

function write(state: TimerState | null) {
  if (state) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function StudyTimer({
  topicId,
  topicName,
}: {
  topicId: string;
  topicName: string;
}) {
  const [state, setState] = useState<TimerState | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [pending, startTransition] = useTransition();

  // The timer survives reloads and navigation by living in localStorage
  useEffect(() => {
    const stored = read();
    if (stored?.topicId === topicId) setState(stored);
  }, [topicId]);

  const total = useCallback(
    (s: TimerState) =>
      s.elapsed + (s.startedAt ? (Date.now() - s.startedAt) / 1000 : 0),
    []
  );

  useEffect(() => {
    if (!state) {
      setSeconds(0);
      return;
    }
    setSeconds(total(state));
    if (!state.startedAt) return;

    const id = window.setInterval(() => setSeconds(total(state)), 1000);
    return () => window.clearInterval(id);
  }, [state, total]);

  function update(next: TimerState | null) {
    write(next);
    setState(next);
  }

  function start() {
    const existing = read();
    if (existing && existing.topicId !== topicId && existing.elapsed > 0) {
      toast.error("A timer is already running on another topic");
      return;
    }
    update({
      topicId,
      startedAt: Date.now(),
      elapsed: state?.elapsed ?? 0,
    });
  }

  function pause() {
    if (!state?.startedAt) return;
    update({ ...state, startedAt: null, elapsed: total(state) });
  }

  function stop() {
    if (!state) return;
    const minutes = Math.round(total(state) / 60);
    update(null);

    if (minutes < 1) {
      toast.info("Under a minute — nothing logged");
      return;
    }

    startTransition(async () => {
      try {
        await logStudySession({ topicId, minutes });
        toast.success(`Logged ${minutes} min on ${topicName}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not log time");
      }
    });
  }

  const running = Boolean(state?.startedAt);

  return (
    <div className="flex items-center gap-2">
      {state ? (
        <>
          <span className="stat-number min-w-16 text-sm font-medium tabular-nums">
            {formatClock(seconds)}
          </span>
          <Button
            size="xs"
            variant="ghost"
            className="text-muted-foreground"
            onClick={running ? pause : start}
          >
            {running ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
            {running ? "Pause" : "Resume"}
          </Button>
          <Button size="xs" variant="outline" onClick={stop} disabled={pending}>
            <Square className="size-3" />
            {pending ? "Saving…" : "Stop & log"}
          </Button>
        </>
      ) : (
        <Button size="xs" variant="outline" onClick={start} disabled={pending}>
          <Play className="size-3.5" />
          Start studying
        </Button>
      )}
    </div>
  );
}
