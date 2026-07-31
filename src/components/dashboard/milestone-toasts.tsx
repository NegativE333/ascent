"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { markMilestonesSeen } from "@/lib/actions";
import { milestoneMessage } from "@/lib/stats";
import type { Subject } from "@/lib/types";

export function MilestoneToasts({
  ids,
  subjects,
}: {
  ids: string[];
  subjects: Subject[];
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || ids.length === 0) return;
    fired.current = true;
    for (const id of ids) {
      toast(milestoneMessage(id, subjects), { duration: 4000 });
    }
    void markMilestonesSeen(ids);
  }, [ids, subjects]);

  return null;
}
