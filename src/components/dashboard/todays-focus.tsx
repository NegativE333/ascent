import Link from "next/link";
import type { TopicWithSubject } from "@/lib/types";
import { StatusTag } from "@/components/syllabus/status-control";

export function TodaysFocus({
  revise,
  next,
}: {
  revise: TopicWithSubject[];
  next: TopicWithSubject | null;
}) {
  const empty = revise.length === 0 && !next;

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold">Today&apos;s focus</h2>
      {empty ? (
        <p className="text-sm text-muted-foreground">
          Nothing urgent — keep logging practice or pick a topic from the
          syllabus.
        </p>
      ) : (
        <ul className="panel divide-y divide-border overflow-hidden">
          {revise.map((t) => (
            <li key={t.id}>
              <Link
                href={`/syllabus/${t.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5 row-hover"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Needs revision · {t.subjects?.name}
                  </p>
                </div>
                <StatusTag status={t.status} />
              </Link>
            </li>
          ))}
          {next && (
            <li>
              <Link
                href={`/syllabus/${next.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5 row-hover"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{next.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Next up · {next.subjects?.name}
                    {next.priority === "high" ? " · high priority" : ""}
                  </p>
                </div>
                <StatusTag status={next.status} />
              </Link>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
