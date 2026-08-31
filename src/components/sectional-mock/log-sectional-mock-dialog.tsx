"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createSectionalMock } from "@/lib/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Subject } from "@/lib/types";

export function LogSectionalMockDialog({
  subjects,
  defaultSubjectId,
  trigger,
}: {
  subjects: Subject[];
  defaultSubjectId?: string;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [subjectId, setSubjectId] = useState(
    defaultSubjectId ?? subjects[0]?.id ?? ""
  );
  const [mockName, setMockName] = useState("");
  const [mockDate, setMockDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [total, setTotal] = useState("25");
  const [correct, setCorrect] = useState("18");
  const [wrong, setWrong] = useState("5");
  const [minutes, setMinutes] = useState("20");
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const totalQuestions = Number(total);
    const correctAnswers = Number(correct);
    const wrongAnswers = Number(wrong);
    const timeTakenMinutes = minutes === "" ? null : Number(minutes);

    if (
      !subjectId ||
      !Number.isFinite(totalQuestions) ||
      totalQuestions <= 0 ||
      !Number.isFinite(correctAnswers) ||
      correctAnswers < 0 ||
      !Number.isFinite(wrongAnswers) ||
      wrongAnswers < 0 ||
      correctAnswers + wrongAnswers > totalQuestions
    ) {
      toast.error("Check question counts");
      return;
    }

    startTransition(async () => {
      try {
        await createSectionalMock({
          subjectId,
          mockName: mockName.trim() || undefined,
          mockDate,
          totalQuestions,
          correctAnswers,
          wrongAnswers,
          timeTakenMinutes,
          notes,
        });
        toast.success("Sectional mock logged");
        setOpen(false);
        setMockName("");
        setNotes("");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to log sectional mock"
        );
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && defaultSubjectId) setSubjectId(defaultSubjectId);
      }}
    >
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm" variant="outline">
              Log sectional mock
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log sectional mock</DialogTitle>
          <DialogDescription>
            One subject only — separate from full-length mocks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={subjectId}
              onValueChange={(v) => setSubjectId(v ?? "")}
            >
              <SelectTrigger id="subject" className="w-full">
                <SelectValue placeholder="Pick subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="mockName">Mock name (optional)</Label>
              <Input
                id="mockName"
                value={mockName}
                onChange={(e) => setMockName(e.target.value)}
                placeholder="SSC Adda Sectional Test 4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mockDate">Date</Label>
              <Input
                id="mockDate"
                type="date"
                value={mockDate}
                onChange={(e) => setMockDate(e.target.value)}
                required
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="wrong">Wrong</Label>
              <Input
                id="wrong"
                type="number"
                min={0}
                value={wrong}
                onChange={(e) => setWrong(e.target.value)}
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
              {pending ? "Saving…" : "Save mock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
