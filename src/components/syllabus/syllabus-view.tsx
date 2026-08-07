"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopicRow } from "@/components/syllabus/topic-row";
import { GA_SECTION_ORDER } from "@/lib/syllabus-seed";
import {
  hoursLabel,
  needsRevision,
  sectionProgress,
  topicsProgress,
} from "@/lib/stats";
import type {
  Subject,
  TopicPriority,
  TopicStatus,
  TopicWithSubject,
} from "@/lib/types";

const priorityRank = { high: 0, medium: 1, low: 2 };

function SubjectSummary({ rows }: { rows: TopicWithSubject[] }) {
  const progress = topicsProgress(rows);

  return (
    <span className="stat-number text-xs text-muted-foreground">
      {progress.done}/{progress.total} done · {progress.percent}% ·{" "}
      {hoursLabel(progress.remainingMinutes)} left
    </span>
  );
}

function sectionSortKey(section: string | null, subjectSlug: string) {
  if (!section) return 999;
  if (subjectSlug === "general-awareness") {
    const idx = (GA_SECTION_ORDER as readonly string[]).indexOf(section);
    return idx === -1 ? 500 : idx;
  }
  return 0;
}

export function SyllabusView({
  subjects,
  topics,
}: {
  subjects: Subject[];
  topics: TopicWithSubject[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectSlug = searchParams.get("subject");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TopicStatus | "all">("all");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<TopicPriority | "all">(
    "all"
  );
  const [specialFilter, setSpecialFilter] = useState<"all" | "revision">("all");

  const sortedSubjects = subjects
    .slice()
    .sort((a, b) => a.display_order - b.display_order);

  const selectedSubject = subjectSlug
    ? sortedSubjects.find((s) => s.slug === subjectSlug)
    : null;

  const filtered = useMemo(() => {
    return topics
      .filter((t) => {
        if (selectedSubject && t.subject_id !== selectedSubject.id) return false;
        if (query && !t.name.toLowerCase().includes(query.toLowerCase()))
          return false;
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        if (priorityFilter !== "all" && t.priority !== priorityFilter)
          return false;
        if (specialFilter === "revision" && !needsRevision(t)) return false;
        if (confidenceFilter === "low" && t.confidence > 2) return false;
        if (
          confidenceFilter === "mid" &&
          (t.confidence < 3 || t.confidence > 4)
        )
          return false;
        if (confidenceFilter === "high" && t.confidence < 5) return false;
        return true;
      })
      .sort((a, b) => {
        const sec =
          sectionSortKey(a.section, a.subjects.slug) -
          sectionSortKey(b.section, b.subjects.slug);
        if (sec !== 0) return sec;
        if (a.display_order !== b.display_order)
          return a.display_order - b.display_order;
        const pr = priorityRank[a.priority] - priorityRank[b.priority];
        if (pr !== 0) return pr;
        return a.name.localeCompare(b.name);
      });
  }, [
    topics,
    query,
    statusFilter,
    confidenceFilter,
    priorityFilter,
    specialFilter,
    selectedSubject,
  ]);

  const groups = selectedSubject
    ? [{ subject: selectedSubject, rows: filtered }]
    : sortedSubjects
        .map((subject) => ({
          subject,
          rows: filtered.filter((t) => t.subject_id === subject.id),
        }))
        .filter((g) => g.rows.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter topics…"
            className="h-8 border-border bg-transparent pl-8 text-sm shadow-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={specialFilter}
            onValueChange={(v) =>
              setSpecialFilter((v ?? "all") as "all" | "revision")
            }
          >
            <SelectTrigger className="h-8 w-[130px] shadow-none">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              <SelectItem value="revision">Needs revision</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(v) =>
              setPriorityFilter((v ?? "all") as TopicPriority | "all")
            }
          >
            <SelectTrigger className="h-8 w-[120px] shadow-none">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter((v ?? "all") as TopicStatus | "all")
            }
          >
            <SelectTrigger className="h-8 w-[130px] shadow-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="not_started">Not started</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedSubject?.slug ?? "all"}
            onValueChange={(v) => {
              if (!v || v === "all") router.push("/syllabus");
              else router.push(`/syllabus?subject=${v}`);
            }}
          >
            <SelectTrigger className="h-8 w-[160px] shadow-none">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {sortedSubjects.map((s) => (
                <SelectItem key={s.id} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={confidenceFilter}
            onValueChange={(v) => setConfidenceFilter(v ?? "all")}
          >
            <SelectTrigger className="h-8 w-[130px] shadow-none">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any confidence</SelectItem>
              <SelectItem value="low">Low (≤2)</SelectItem>
              <SelectItem value="mid">Mid (3–4)</SelectItem>
              <SelectItem value="high">Max (5)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="panel px-4 py-12 text-center">
          <p className="text-sm font-medium">No topics match</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing filters or searching a different term.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ subject, rows }) => {
            const hasSections = rows.some((t) => t.section);
            const sections = hasSections
              ? sectionProgress(
                  rows,
                  subject.slug === "general-awareness"
                    ? GA_SECTION_ORDER
                    : undefined
                )
              : [];

            return (
              <section key={subject.id} className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    {subject.name}
                  </h2>
                  <SubjectSummary rows={rows} />
                </div>

                {hasSections ? (
                  <div className="space-y-4">
                    {sections.map((sec) => {
                      const sectionRows = rows.filter(
                        (t) => (t.section?.trim() || "Other") === sec.section
                      );
                      return (
                        <div key={sec.section}>
                          <div className="mb-1.5 flex items-baseline justify-between gap-2">
                            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {sec.section}
                            </h3>
                            <span className="stat-number text-[11px] text-muted-foreground">
                              {sec.done}/{sec.total} · {sec.percent}% ·{" "}
                              {hoursLabel(sec.remainingMinutes)} left
                            </span>
                          </div>
                          <div className="mb-2 h-1 overflow-hidden rounded-[2px] bg-track">
                            <div
                              className="h-full rounded-[2px] bg-primary transition-[width] duration-200"
                              style={{ width: `${sec.percent}%` }}
                            />
                          </div>
                          <div className="panel overflow-hidden">
                            <div className="table-head hidden border-b border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1.3fr)_auto_auto_auto_auto] sm:gap-3">
                              <span>Topic</span>
                              <span>Priority</span>
                              <span>Confidence</span>
                              <span>Status</span>
                              <span />
                            </div>
                            {sectionRows.map((topic) => (
                              <TopicRow key={topic.id} topic={topic} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="panel overflow-hidden">
                    <div className="table-head hidden border-b border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1.3fr)_auto_auto_auto_auto] sm:gap-3">
                      <span>Topic</span>
                      <span>Priority</span>
                      <span>Confidence</span>
                      <span>Status</span>
                      <span />
                    </div>
                    {rows.map((topic) => (
                      <TopicRow key={topic.id} topic={topic} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
