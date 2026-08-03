"use client";

import Link from "next/link";
import { SUBJECT_COLORS, type Subject } from "@/lib/types";
import { GA_SECTION_ORDER } from "@/lib/syllabus-seed";
import { sectionProgress, type SectionProgress } from "@/lib/stats";
import type { Topic } from "@/lib/types";

export function SubjectProgress({
  items,
  topics,
}: {
  items: {
    subject: Subject;
    percent: number;
    done: number;
    total: number;
  }[];
  topics: Topic[];
}) {
  return (
    <div className="space-y-5">
      {items.map((item) => {
        const color = SUBJECT_COLORS[item.subject.slug] ?? "var(--primary)";
        const sections =
          item.subject.slug === "general-awareness"
            ? sectionProgress(
                topics.filter((t) => t.subject_id === item.subject.id),
                GA_SECTION_ORDER
              )
            : [];

        return (
          <div key={item.subject.id} className="space-y-2">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <Link
                href={`/syllabus?subject=${item.subject.slug}`}
                className="text-sm text-foreground hover:underline"
              >
                {item.subject.name}
              </Link>
              <p className="stat-number text-xs text-muted-foreground">
                {item.done}/{item.total} · {item.percent}%
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-[2px] bg-track">
              <div
                className="h-full rounded-[2px] transition-[width] duration-200"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: color,
                }}
              />
            </div>

            {sections.length > 0 && (
              <div className="space-y-1.5 border-l border-border pl-3">
                {sections.map((sec) => (
                  <SectionBar key={sec.section} section={sec} color={color} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionBar({
  section,
  color,
}: {
  section: SectionProgress;
  color: string;
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{section.section}</p>
        <p className="stat-number text-[11px] text-muted-foreground">
          {section.done}/{section.total} · {section.percent}%
        </p>
      </div>
      <div className="h-1 overflow-hidden rounded-[2px] bg-track">
        <div
          className="h-full rounded-[2px] transition-[width] duration-200"
          style={{
            width: `${section.percent}%`,
            backgroundColor: color,
            opacity: 0.7,
          }}
        />
      </div>
    </div>
  );
}
