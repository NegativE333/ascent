"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  eyebrow?: string;
  children?: ReactNode;
  empty?: string;
  className?: string;
};

/** Facts side panel used by Explore (tap) and Hunt (after answer). */
export function FactsPanel({
  title,
  eyebrow,
  children,
  empty = "Select something on the map to read its notes.",
  className,
}: Props) {
  if (!title) {
    return (
      <div className={cn("panel space-y-2 p-4", className)}>
        <p className="section-label">Facts</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{empty}</p>
      </div>
    );
  }

  return (
    <div className={cn("panel space-y-3 p-4", className)}>
      {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium text-foreground/80">{label}: </span>
      {value}
    </p>
  );
}
