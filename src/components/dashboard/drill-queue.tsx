import Link from "next/link";
import { ConfidenceStars } from "@/components/syllabus/confidence-stars";
import type { DrillItem } from "@/lib/stats";

export function DrillQueue({ items }: { items: DrillItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        No drill targets yet. Practice a few topics or log a mock with sectional
        scores and weak spots will show up here.
      </p>
    );
  }

  const next = items[0];

  return (
    <div className="space-y-3">
      <Link
        href={`/syllabus/${next.topic.id}`}
        className="panel flex items-center justify-between gap-3 px-3 py-3 row-hover"
      >
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">Practice next</p>
          <p className="truncate text-sm font-medium">{next.topic.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {next.reason}
            {next.topic.subjects?.name ? ` · ${next.topic.subjects.name}` : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-[4px] bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
          Open
        </span>
      </Link>

      <ul className="panel divide-y divide-border overflow-hidden">
        {items.slice(1, 6).map((item) => (
          <li key={item.topic.id}>
            <Link
              href={`/syllabus/${item.topic.id}`}
              className="flex items-center justify-between gap-3 px-3 py-2 row-hover"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {item.topic.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {item.reason}
                </p>
              </div>
              <ConfidenceStars value={item.topic.confidence} size="sm" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
