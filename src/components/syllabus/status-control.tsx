"use client";

import { cn } from "@/lib/utils";
import type { TopicStatus } from "@/lib/types";

const options: { value: TopicStatus; label: string; className: string }[] = [
  {
    value: "not_started",
    label: "Not started",
    className: "bg-status-todo-bg text-status-todo-fg",
  },
  {
    value: "in_progress",
    label: "In progress",
    className: "bg-status-doing-bg text-status-doing-fg",
  },
  {
    value: "done",
    label: "Done",
    className: "bg-status-done-bg text-status-done-fg",
  },
];

export function StatusControl({
  value,
  onChange,
  disabled,
}: {
  value: TopicStatus;
  onChange: (status: TopicStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5",
        disabled && "pointer-events-none opacity-60"
      )}
      role="group"
      aria-label="Topic status"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-[3px] px-1.5 py-0.5 text-[11px] font-medium transition-colors duration-150",
            value === opt.value
              ? opt.className
              : "text-muted-foreground hover:bg-surface-hover"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function StatusTag({ status }: { status: TopicStatus }) {
  const opt = options.find((o) => o.value === status) ?? options[0];
  return (
    <span
      className={cn(
        "inline-flex rounded-[3px] px-1.5 py-0.5 text-[11px] font-medium",
        opt.className
      )}
    >
      {opt.label}
    </span>
  );
}
