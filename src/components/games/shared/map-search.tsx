"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type SearchItem = {
  id: string;
  label: string;
  hint?: string;
};

type Props = {
  items: SearchItem[];
  placeholder?: string;
  onPick: (id: string) => void;
  className?: string;
};

export function MapSearch({
  items,
  placeholder = "Search…",
  onPick,
  className,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    return items
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.hint?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [items, query]);

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Allow click on result before closing
            window.setTimeout(() => setOpen(false), 150);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {open && matches.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-card shadow-sm">
          {matches.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-surface-hover"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(item.id);
                  setQuery(item.label);
                  setOpen(false);
                }}
              >
                <span className="font-medium text-foreground">{item.label}</span>
                {item.hint ? (
                  <span className="text-[11px] text-muted-foreground">
                    {item.hint}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
