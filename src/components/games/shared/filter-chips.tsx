"use client";

import { cn } from "@/lib/utils";

type Chip = { id: string; label: string };

type Props = {
  chips: Chip[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

export function FilterChips({ chips, value, onChange, className }: Props) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onChange(chip.id)}
          className={cn(
            "rounded-md border px-2.5 py-1 text-xs transition-colors",
            value === chip.id
              ? "border-foreground/20 bg-foreground text-background"
              : "border-border bg-card text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
