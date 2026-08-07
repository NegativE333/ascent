"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { markTopicRevised } from "@/lib/actions";
import type { ReviewItem } from "@/lib/stats";
import { Button } from "@/components/ui/button";

function dueLabel(daysOverdue: number) {
  if (daysOverdue === 0) return "Due today";
  if (daysOverdue === 1) return "1 day late";
  return `${daysOverdue} days late`;
}

export function RevisionQueue({
  due,
  upcoming,
}: {
  due: ReviewItem[];
  upcoming: ReviewItem[];
}) {
  const [, startTransition] = useTransition();
  const [cleared, addCleared] = useOptimistic<string[], string>(
    [],
    (state, id) => [...state, id]
  );

  const visible = due.filter((item) => !cleared.includes(item.topic.id));
  const nextUp = upcoming[0];

  function review(topicId: string, name: string, recall: "good" | "hard") {
    startTransition(async () => {
      addCleared(topicId);
      try {
        await markTopicRevised(topicId, recall);
        toast.success(
          recall === "good" ? `${name} scheduled further out` : `${name} back in the queue soon`
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save review");
      }
    });
  }

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Revision queue</h2>
        <span className="text-xs text-muted-foreground">
          {visible.length > 0
            ? `${visible.length} due`
            : nextUp
              ? `Next ${format(parseISO(nextUp.dueDate), "MMM d")}`
              : "Nothing scheduled"}
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {nextUp
            ? `All caught up. ${nextUp.topic.name} comes back on ${format(parseISO(nextUp.dueDate), "MMM d")}.`
            : "Mark a topic in progress or log practice to start scheduling revisions."}
        </p>
      ) : (
        <ul className="panel divide-y divide-border overflow-hidden">
          {visible.slice(0, 6).map((item) => (
            <li
              key={item.topic.id}
              className="flex flex-col gap-2 px-3 py-2.5 row-hover sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/syllabus/${item.topic.id}`}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {item.topic.name}
                </Link>
                <p className="text-[11px] text-muted-foreground">
                  {dueLabel(item.daysOverdue)} · {item.topic.subjects?.name} ·
                  every {item.intervalDays}d
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  size="xs"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => review(item.topic.id, item.topic.name, "hard")}
                >
                  Shaky
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => review(item.topic.id, item.topic.name, "good")}
                >
                  Revised
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
