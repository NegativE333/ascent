import Link from "next/link";
import type { TopicWithSubject } from "@/lib/types";
import { StatusTag } from "@/components/syllabus/status-control";

export function TodaysFocus({ next }: { next: TopicWithSubject | null }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold">Next up</h2>
      {!next ? (
        <p className="text-sm text-muted-foreground">
          Every topic is started — keep logging practice to build accuracy.
        </p>
      ) : (
        <ul className="panel divide-y divide-border overflow-hidden">
          <li>
            <Link
              href={`/syllabus/${next.id}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 row-hover"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{next.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {next.subjects?.name}
                  {next.priority === "high" ? " · high priority" : ""}
                </p>
              </div>
              <StatusTag status={next.status} />
            </Link>
          </li>
        </ul>
      )}
    </section>
  );
}
