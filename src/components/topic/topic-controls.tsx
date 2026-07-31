"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  updateTopicConfidence,
  updateTopicPriority,
  updateTopicStatus,
} from "@/lib/actions";
import { ConfidenceStars } from "@/components/syllabus/confidence-stars";
import { StatusControl } from "@/components/syllabus/status-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TopicPriority, TopicStatus, TopicWithSubject } from "@/lib/types";

export function TopicControls({ topic }: { topic: TopicWithSubject }) {
  const [pending, startTransition] = useTransition();

  function setStatus(status: TopicStatus) {
    startTransition(async () => {
      try {
        await updateTopicStatus(topic.id, status);
        if (status === "done") toast.success("Topic marked done");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  function setConfidence(confidence: number) {
    startTransition(async () => {
      try {
        await updateTopicConfidence(topic.id, confidence);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  function setPriority(priority: TopicPriority) {
    startTransition(async () => {
      try {
        await updateTopicPriority(topic.id, priority);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  return (
    <section className="flex flex-col gap-4 border-y border-border py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">Status</p>
        <StatusControl
          value={topic.status}
          onChange={setStatus}
          disabled={pending}
        />
      </div>
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">Priority</p>
        <Select
          value={topic.priority}
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
        <ConfidenceStars value={topic.confidence} onChange={setConfidence} />
      </div>
    </section>
  );
}
