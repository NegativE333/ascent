"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateUserSettings } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserSettings } from "@/lib/types";

export function SettingsForm({
  settings,
  suggested,
}: {
  settings: UserSettings;
  suggested: { topics: number; mcqs: number };
}) {
  const [examDate, setExamDate] = useState(settings.exam_date ?? "");
  const [topics, setTopics] = useState(String(settings.weekly_target_topics));
  const [mcqs, setMcqs] = useState(String(settings.weekly_target_mcqs));
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateUserSettings({
          examDate: examDate || null,
          weeklyTargetTopics: Number(topics) || 3,
          weeklyTargetMcqs: Number(mcqs) || 100,
        });
        toast.success("Settings saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={save} className="max-w-md space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="examDate" className="text-xs">
          Exam date
        </Label>
        <Input
          id="examDate"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="h-9 shadow-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="topics" className="text-xs">
            Weekly topic target
          </Label>
          <Input
            id="topics"
            type="number"
            min={1}
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            className="h-9 shadow-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mcqs" className="text-xs">
            Weekly MCQ target
          </Label>
          <Input
            id="mcqs"
            type="number"
            min={1}
            value={mcqs}
            onChange={(e) => setMcqs(e.target.value)}
            className="h-9 shadow-none"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Suggested from your pace: {suggested.topics} topics / {suggested.mcqs}{" "}
        MCQs per week.{" "}
        <button
          type="button"
          className="underline hover:text-foreground"
          onClick={() => {
            setTopics(String(suggested.topics));
            setMcqs(String(suggested.mcqs));
          }}
        >
          Apply suggestion
        </button>
      </p>

      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
