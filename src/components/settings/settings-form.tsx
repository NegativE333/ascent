"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateUserSettings } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TIER1_CUTOFFS,
  type CutoffCategory,
  type UserSettings,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function SettingsForm({
  settings,
  suggested,
}: {
  settings: UserSettings;
  suggested: { topics: number; mcqs: number; hoursPerWeek: number };
}) {
  const [examDate, setExamDate] = useState(settings.exam_date ?? "");
  const [topics, setTopics] = useState(String(settings.weekly_target_topics));
  const [mcqs, setMcqs] = useState(String(settings.weekly_target_mcqs));
  const [targetScore, setTargetScore] = useState(String(settings.target_score));
  const [cutoff, setCutoff] = useState<CutoffCategory>(
    settings.cutoff_category ?? "ur"
  );
  const [pending, startTransition] = useTransition();

  function applyCutoff(id: CutoffCategory) {
    setCutoff(id);
    const preset = TIER1_CUTOFFS.find((c) => c.id === id);
    if (preset) setTargetScore(String(preset.score));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateUserSettings({
          examDate: examDate || null,
          weeklyTargetTopics: Number(topics) || 3,
          weeklyTargetMcqs: Number(mcqs) || 100,
          targetScore: Number(targetScore) || 150,
          cutoffCategory: cutoff,
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

      <div className="space-y-2">
        <Label className="text-xs">Cutoff category</Label>
        <div className="flex flex-wrap gap-1">
          {TIER1_CUTOFFS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => applyCutoff(c.id)}
              className={cn(
                "rounded-[4px] px-2 py-1 text-[11px] font-medium transition-colors",
                cutoff === c.id
                  ? "bg-foreground text-background"
                  : "bg-surface-hover text-muted-foreground hover:text-foreground"
              )}
            >
              {c.label} · {c.score}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCutoff("custom")}
            className={cn(
              "rounded-[4px] px-2 py-1 text-[11px] font-medium transition-colors",
              cutoff === "custom"
                ? "bg-foreground text-background"
                : "bg-surface-hover text-muted-foreground hover:text-foreground"
            )}
          >
            Custom
          </button>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="targetScore" className="text-xs">
            Target Tier 1 score
          </Label>
          <Input
            id="targetScore"
            type="number"
            min={1}
            max={200}
            value={targetScore}
            onChange={(e) => {
              setTargetScore(e.target.value);
              setCutoff("custom");
            }}
            className="h-9 shadow-none"
          />
          <p className="text-[11px] text-muted-foreground">
            Approximate planning cutoffs — real ones vary by year and post.
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        To finish before your exam you need roughly{" "}
        {suggested.hoursPerWeek > 0
          ? `${suggested.hoursPerWeek}h of study a week — about `
          : ""}
        {suggested.topics} topics / {suggested.mcqs} MCQs per week.{" "}
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
