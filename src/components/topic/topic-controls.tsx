"use client";

import { useOptimistic, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  markTopicRevised,
  updateTopicConfidence,
  updateTopicPriority,
  updateTopicStatus,
} from "@/lib/actions";
import { reviewSchedule, topicMinutes } from "@/lib/stats";
import { ConfidenceStars } from "@/components/syllabus/confidence-stars";
import { StatusControl } from "@/components/syllabus/status-control";
import { EstimateEditor } from "@/components/topic/estimate-editor";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TopicPriority, TopicStatus, TopicWithSubject } from "@/lib/types";

export function TopicControls({ topic }: { topic: TopicWithSubject }) {
  const [, startTransition] = useTransition();
  const [status, showStatus] = useOptimistic(topic.status);
  const [confidence, showConfidence] = useOptimistic(topic.confidence);
  const [priority, showPriority] = useOptimistic(topic.priority);

  const review = reviewSchedule([topic])[0] ?? null;

  function setStatus(next: TopicStatus) {
    startTransition(async () => {
      showStatus(next);
      try {
        await updateTopicStatus(topic.id, next);
        if (next === "done") toast.success("Topic marked done");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  function setConfidence(next: number) {
    startTransition(async () => {
      showConfidence(next);
      try {
        await updateTopicConfidence(topic.id, next);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  function setPriority(next: TopicPriority) {
    startTransition(async () => {
      showPriority(next);
      try {
        await updateTopicPriority(topic.id, next);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  function logRevision(recall: "good" | "hard") {
    startTransition(async () => {
      try {
        await markTopicRevised(topic.id, recall);
        toast.success(
          recall === "good" ? "Revision logged" : "Scheduled again soon"
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  return (
    <div className="space-y-3 border-y border-border py-3">
      <section className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">Status</p>
          <StatusControl value={status} onChange={setStatus} />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">Priority</p>
          <Select
            value={priority}
            onValueChange={(v) => v && setPriority(v as TopicPriority)}
          >
            <SelectTrigger className="h-7 w-[100px] text-xs shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">Confidence</p>
          <ConfidenceStars value={confidence} onChange={setConfidence} />
        </div>
      </section>

      <section className="border-t border-border pt-3">
        <EstimateEditor topicId={topic.id} minutes={topicMinutes(topic)} />
      </section>

      {review && (
        <section className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            {review.daysOverdue >= 0
              ? `Due for revision${review.daysOverdue > 0 ? ` (${review.daysOverdue}d late)` : " today"}`
              : `Next revision ${format(parseISO(review.dueDate), "MMM d")}`}
            {" · every "}
            {review.intervalDays} days
          </p>
          <div className="flex gap-1.5">
            <Button
              size="xs"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => logRevision("hard")}
            >
              Shaky
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => logRevision("good")}
            >
              Revised today
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
