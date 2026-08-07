"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTopicEstimate } from "@/lib/actions";
import { hoursLabel } from "@/lib/stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EstimateEditor({
  topicId,
  minutes,
}: {
  topicId: string;
  minutes: number;
}) {
  const [value, setValue] = useState(String(minutes > 0 ? minutes : 60));
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    const next = Number(value);
    if (!Number.isFinite(next) || next < 5) {
      toast.error("Use at least 5 minutes");
      return;
    }
    startTransition(async () => {
      try {
        await updateTopicEstimate(topicId, next);
        toast.success(`Estimate set to ${hoursLabel(next)}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  return (
    <form onSubmit={save} className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <Label htmlFor="estimate" className="text-xs text-muted-foreground">
          Your estimate (minutes)
        </Label>
        <Input
          id="estimate"
          type="number"
          min={5}
          max={1440}
          step={5}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 w-28 shadow-none"
        />
      </div>
      <Button type="submit" size="xs" variant="outline" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      <span className="text-[11px] text-muted-foreground">
        Affects pace and progress weighting · ~{hoursLabel(Number(value) || 0)}
      </span>
    </form>
  );
}
