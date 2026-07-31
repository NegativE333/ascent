import { format, parseISO } from "date-fns";
import { accuracy, netScore } from "@/lib/stats";
import type { McqSession } from "@/lib/types";

export function SessionTable({ sessions }: { sessions: McqSession[] }) {
  if (sessions.length === 0) {
    return (
      <div className="panel px-4 py-10 text-center text-sm text-muted-foreground">
        No sessions logged for this topic yet.
      </div>
    );
  }

  const ordered = [...sessions].reverse();

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="table-head border-b border-border text-[11px] text-muted-foreground">
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Score</th>
            <th className="px-3 py-2 font-medium">Accuracy</th>
            <th className="px-3 py-2 font-medium">Net (−0.5)</th>
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((s) => {
            const acc = accuracy(s);
            const net = netScore(s);
            return (
              <tr
                key={s.id}
                className="border-b border-border last:border-0 row-hover"
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  {format(parseISO(s.session_date), "MMM d, yyyy")}
                </td>
                <td className="stat-number px-3 py-2">
                  {s.correct_answers}/{s.total_questions}
                </td>
                <td className="stat-number px-3 py-2 text-muted-foreground">
                  {acc}%
                </td>
                <td className="stat-number px-3 py-2 font-medium">{net}</td>
                <td className="stat-number px-3 py-2 text-muted-foreground">
                  {s.time_taken_minutes != null
                    ? `${s.time_taken_minutes}m`
                    : "—"}
                </td>
                <td className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">
                  {s.notes || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
