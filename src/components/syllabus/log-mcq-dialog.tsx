"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createMcqSession } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LogMcqDialog({
  topicId,
  topicName,
  trigger,
}: {
  topicId: string;
  topicName: string;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [total, setTotal] = useState("25");
  const [correct, setCorrect] = useState("20");
  const [minutes, setMinutes] = useState("30");
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const totalQuestions = Number(total);
    const correctAnswers = Number(correct);
    const timeTakenMinutes = minutes === "" ? null : Number(minutes);

    if (
      !Number.isFinite(totalQuestions) ||
      totalQuestions <= 0 ||
      !Number.isFinite(correctAnswers) ||
      correctAnswers < 0 ||
      correctAnswers > totalQuestions
    ) {
      toast.error("Check question counts");
      return;
    }

    startTransition(async () => {
      try {
        await createMcqSession({
          topicId,
          totalQuestions,
          correctAnswers,
          timeTakenMinutes,
          notes,
        });
        toast.success("Practice session logged");
        setOpen(false);
        setNotes("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to log session");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm" variant="outline">
              Log MCQs
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log MCQ session</DialogTitle>
          <DialogDescription>{topicName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="total">Questions</Label>
              <Input
                id="total"
                type="number"
                min={1}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correct">Correct</Label>
              <Input
                id="correct"
                type="number"
                min={0}
                value={correct}
                onChange={(e) => setCorrect(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutes">Time (minutes)</Label>
            <Input
              id="minutes"
              type="number"
              min={0}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mistakes, patterns…"
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
