"use client";

import { cn } from "@/lib/utils";

export function ConfidenceStars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: "sm" | "md";
}) {
  const interactive = Boolean(onChange);
  const dim = size === "sm" ? "size-2" : "size-2.5";

  return (
    <div
      className="flex items-center gap-1"
      role={interactive ? "slider" : "img"}
      aria-label={`Confidence ${value} of 5`}
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={value}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const level = i + 1;
        const active = level <= value;
        return (
          <button
            key={level}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(value === level ? level - 1 : level)}
            className={cn(
              "rounded-full transition-colors duration-150",
              interactive ? "cursor-pointer" : "cursor-default",
              dim,
              active
                ? "bg-primary"
                : "bg-dot-empty hover:bg-dot-empty-hover"
            )}
            aria-label={`Set confidence to ${level}`}
          />
        );
      })}
    </div>
  );
}
