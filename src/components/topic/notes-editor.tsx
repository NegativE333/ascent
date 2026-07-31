"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTopicNotes } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NotesEditor({
  topicId,
  initialNotes,
}: {
  topicId: string;
  initialNotes: string | null;
}) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setNotes(initialNotes ?? "");
  }, [initialNotes]);

  function save() {
    startTransition(async () => {
      try {
        await updateTopicNotes(topicId, notes);
        toast.success("Notes saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Formulas, shortcuts, common traps…"
        rows={6}
        className="min-h-32 resize-y shadow-none"
      />
      <Button onClick={save} disabled={pending} size="sm" variant="outline">
        {pending ? "Saving…" : "Save notes"}
      </Button>
    </div>
  );
}
