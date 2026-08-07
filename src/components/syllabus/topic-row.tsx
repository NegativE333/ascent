"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ClipboardList } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import {
  updateTopicConfidence,
  updateTopicPriority,
  updateTopicStatus,
} from "@/lib/actions";
import { hoursLabel, needsRevision, topicMinutes } from "@/lib/stats";
import type { TopicPriority, TopicStatus, TopicWithSubject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConfidenceStars } from "@/components/syllabus/confidence-stars";
import { LogMcqDialog } from "@/components/syllabus/log-mcq-dialog";
import { StatusControl } from "@/components/syllabus/status-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TopicRow({ topic }: { topic: TopicWithSubject }) {
  const [, startTransition] = useTransition();
  const revise = needsRevision(topic);

  // Optimistic values revert automatically if the action fails
  const [status, showStatus] = useOptimistic(topic.status);
  const [confidence, showConfidence] = useOptimistic(topic.confidence);
  const [priority, showPriority] = useOptimistic(topic.priority);

  function setStatus(next: TopicStatus) {
    startTransition(async () => {
      showStatus(next);
      try {
        await updateTopicStatus(topic.id, next);
        if (next === "done") toast.success(`${topic.name} marked done`);
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

  return (
    <div className="group grid grid-cols-1 items-center gap-2 border-b border-border px-3 py-2 row-hover last:border-b-0 sm:grid-cols-[minmax(0,1.3fr)_auto_auto_auto_auto] sm:gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/syllabus/${topic.id}`}
            className="text-sm font-medium text-foreground hover:underline"
          >
            {topic.name}
          </Link>
          {revise && (
            <span className="rounded-[3px] bg-tag-revise-bg px-1.5 py-0.5 text-[10px] font-medium text-tag-revise-fg">
              Revise
            </span>
          )}
          {priority === "high" && (
            <span className="rounded-[3px] bg-tag-high-bg px-1.5 py-0.5 text-[10px] font-medium text-tag-high-fg">
              High
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          ~{hoursLabel(topicMinutes(topic))} ·{" "}
          {topic.last_practiced_at
            ? `practiced ${formatDistanceToNow(new Date(topic.last_practiced_at), { addSuffix: true })}`
            : "never practiced"}
        </p>
      </div>

      <Select
        value={priority}
        onValueChange={(v) => v && setPriority(v as TopicPriority)}
      >
        <SelectTrigger className="h-7 w-[88px] text-[11px] shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <div className="opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-150 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <ConfidenceStars value={confidence} onChange={setConfidence} />
      </div>

      <StatusControl value={status} onChange={setStatus} />

      <div className="opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-150 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <LogMcqDialog
          topicId={topic.id}
          topicName={topic.name}
          trigger={
            <Button size="xs" variant="ghost" className="gap-1 text-muted-foreground">
              <ClipboardList className="size-3.5" />
              Log
            </Button>
          }
        />
      </div>
    </div>
  );
}
