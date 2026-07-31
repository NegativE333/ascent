"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { TopicWithSubject } from "@/lib/types";

export function NotesSheet({ topics }: { topics: TopicWithSubject[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return topics;
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subjects?.name.toLowerCase().includes(q) ||
        (t.notes ?? "").toLowerCase().includes(q)
    );
  }, [topics, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes…"
          className="h-8 border-border bg-transparent pl-8 text-sm shadow-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-sm text-muted-foreground">
          {topics.length === 0
            ? "No notes yet. Add formulas on any topic detail page."
            : "No notes match your search."}
        </p>
      ) : (
        <div className="space-y-6">
          {filtered.map((t) => (
            <article key={t.id} className="border-b border-border pb-5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">
                  <Link
                    href={`/syllabus/${t.id}`}
                    className="hover:underline"
                  >
                    {t.name}
                  </Link>
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  {t.subjects?.name}
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {t.notes}
              </pre>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
