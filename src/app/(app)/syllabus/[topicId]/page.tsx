import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AccuracyChart } from "@/components/topic/accuracy-chart";
import { NotesEditor } from "@/components/topic/notes-editor";
import { SessionTable } from "@/components/topic/session-table";
import { LogMcqDialog } from "@/components/syllabus/log-mcq-dialog";
import { TopicControls } from "@/components/topic/topic-controls";
import { getTopic, getTopicSessions } from "@/lib/data";
import { SUBJECT_COLORS, STATUS_LABELS } from "@/lib/types";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const [topic, sessions] = await Promise.all([
    getTopic(topicId),
    getTopicSessions(topicId),
  ]);

  if (!topic) notFound();

  const color = SUBJECT_COLORS[topic.subjects?.slug ?? ""] ?? "var(--primary)";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/syllabus"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to syllabus
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {topic.subjects?.name}
            </p>
            <h1 className="page-title">{topic.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {STATUS_LABELS[topic.status]} · confidence {topic.confidence}/5
            </p>
          </div>
          <LogMcqDialog topicId={topic.id} topicName={topic.name} />
        </div>
      </div>

      <TopicControls topic={topic} />

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold">Accuracy trend</h2>
          <div className="panel p-4">
            <AccuracyChart sessions={sessions} />
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold">Notes</h2>
          <div className="panel p-4">
            <NotesEditor topicId={topic.id} initialNotes={topic.notes} />
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Session history</h2>
          <span className="text-xs text-muted-foreground">
            {sessions.length} sessions
          </span>
        </div>
        <SessionTable sessions={sessions} />
      </section>
    </div>
  );
}
