import Link from "next/link";
import { ConfidenceStars } from "@/components/syllabus/confidence-stars";
import type { TopicWithSubject } from "@/lib/types";

export function WeakTopics({ topics }: { topics: TopicWithSubject[] }) {
  if (topics.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        No weak topics yet. Topics show up here once you&apos;ve practiced them
        but still rate confidence ≤ 2.
      </p>
    );
  }

  return (
    <ul className="panel divide-y divide-border overflow-hidden">
      {topics.slice(0, 6).map((topic) => (
        <li key={topic.id}>
          <Link
            href={`/syllabus/${topic.id}`}
            className="flex items-center justify-between gap-3 px-3 py-2 row-hover"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{topic.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {topic.subjects?.name}
              </p>
            </div>
            <ConfidenceStars value={topic.confidence} size="sm" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
