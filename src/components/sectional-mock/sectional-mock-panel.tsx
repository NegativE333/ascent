"use client";

import { format, parseISO } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "@/hooks/use-chart-theme";
import {
  sectionalMockAccuracy,
  sectionalMockNetScore,
} from "@/lib/stats";
import { SUBJECT_COLORS, type SectionalMock, type Subject } from "@/lib/types";
import { LogSectionalMockDialog } from "@/components/sectional-mock/log-sectional-mock-dialog";

export function SectionalMockPanel({
  subject,
  subjects,
  mocks,
}: {
  subject: Subject;
  subjects: Subject[];
  mocks: SectionalMock[];
}) {
  const theme = useChartTheme();
  const subjectMocks = mocks
    .filter((m) => m.subject_id === subject.id)
    .sort((a, b) => a.mock_date.localeCompare(b.mock_date));

  const color = SUBJECT_COLORS[subject.slug] ?? theme.primary;

  const chartData = subjectMocks.map((m) => ({
    date: format(parseISO(m.mock_date), "MMM d"),
    net: sectionalMockNetScore(m),
    accuracy: sectionalMockAccuracy(m),
  }));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Sectional mocks</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Subject-wide practice tests — not topic-specific MCQ sessions.
          </p>
        </div>
        <LogSectionalMockDialog
          subjects={subjects}
          defaultSubjectId={subject.id}
        />
      </div>

      {subjectMocks.length === 0 ? (
        <div className="panel px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No sectional mocks logged for {subject.name} yet.
          </p>
        </div>
      ) : (
        <>
          {chartData.length > 0 && (
            <div className="panel p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Net score trend (−0.5 marking)
              </p>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid stroke={theme.grid} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: theme.tick, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: theme.tick, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: theme.tooltipBg,
                        border: `1px solid ${theme.tooltipBorder}`,
                        borderRadius: 6,
                        fontSize: 12,
                        color: theme.tooltipText,
                      }}
                      formatter={(value, name) => [
                        name === "net" ? value : `${value}%`,
                        name === "net" ? "Net score" : "Accuracy",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke={color}
                      strokeWidth={2}
                      dot={{ r: 3, fill: color, strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="panel overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="table-head border-b border-border text-[11px] text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Mock</th>
                  <th className="px-3 py-2 font-medium">Score</th>
                  <th className="px-3 py-2 font-medium">Accuracy</th>
                  <th className="px-3 py-2 font-medium">Net</th>
                  <th className="px-3 py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {[...subjectMocks].reverse().map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-0 row-hover"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {format(parseISO(m.mock_date), "MMM d, yyyy")}
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-2 text-muted-foreground">
                      {m.mock_name || "—"}
                    </td>
                    <td className="stat-number px-3 py-2">
                      {m.correct_answers}/{m.total_questions}
                      <span className="text-muted-foreground">
                        {" "}
                        (−{m.wrong_answers})
                      </span>
                    </td>
                    <td className="stat-number px-3 py-2 text-muted-foreground">
                      {sectionalMockAccuracy(m)}%
                    </td>
                    <td className="stat-number px-3 py-2 font-medium">
                      {sectionalMockNetScore(m)}
                    </td>
                    <td className="stat-number px-3 py-2 text-muted-foreground">
                      {m.time_taken_minutes != null
                        ? `${m.time_taken_minutes}m`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
