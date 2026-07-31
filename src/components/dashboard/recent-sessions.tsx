import Link from "next/link";
import { format, parseISO } from "date-fns";
import { accuracy } from "@/lib/stats";
import type { McqSession } from "@/lib/types";

export function RecentSessions({ sessions }: { sessions: McqSession[] }) {
  if (sessions.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        No practice sessions yet. Log MCQs from the syllabus to see them here.
      </p>
    );
  }

  return (
    <ul className="panel divide-y divide-border overflow-hidden">
      {sessions.map((s) => {
        const acc = accuracy(s);
        const topic = s.topics;
        return (
          <li key={s.id}>
            <Link
              href={topic ? `/syllabus/${topic.id}` : "/syllabus"}
              className="flex items-center justify-between gap-3 px-3 py-2 row-hover"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {topic?.name ?? "Topic"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {format(parseISO(s.session_date), "MMM d")} ·{" "}
                  {s.correct_answers}/{s.total_questions}
                  {s.time_taken_minutes != null
                    ? ` · ${s.time_taken_minutes}m`
                    : ""}
                </p>
              </div>
              <span className="stat-number shrink-0 text-sm font-medium text-muted-foreground">
                {acc}%
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
