"use client";

import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "@/hooks/use-chart-theme";
import {
  sectionalMockBySubject,
  weakestSectionalMockSubject,
} from "@/lib/stats";
import { SUBJECT_COLORS, type SectionalMock, type Subject } from "@/lib/types";

export function SectionalMockComparison({
  mocks,
  subjects,
}: {
  mocks: SectionalMock[];
  subjects: Subject[];
}) {
  const theme = useChartTheme();
  const stats = sectionalMockBySubject(mocks, subjects);
  const withData = stats.filter((s) => s.mocks > 0);
  const weakest = weakestSectionalMockSubject(stats);

  if (withData.length === 0) {
    return (
      <div className="panel px-4 py-8 text-center">
        <p className="text-sm font-medium">No sectional mocks logged yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Log subject-only mocks from the syllabus (pick a subject) or use the
          button above. Compare performance here once you have a few entries.
        </p>
      </div>
    );
  }

  const barData = withData.map((s) => ({
    label: shortLabel(s.label),
    avgNet: s.avgNet,
    color: SUBJECT_COLORS[s.slug] ?? theme.primary,
  }));

  const dates = Array.from(
    new Set(withData.flatMap((s) => s.trend.map((p) => p.date)))
  ).sort();

  const lineData = dates.map((date) => {
    const row: Record<string, string | number> = {
      label: format(parseISO(date), "MMM d"),
    };
    for (const section of withData) {
      const hit = section.trend.find((p) => p.date === date);
      if (hit) row[section.label] = hit.net;
    }
    return row;
  });

  return (
    <div className="space-y-4">
      {weakest && (
        <p className="text-sm text-muted-foreground">
          Weakest subject at sectional level is{" "}
          <span className="font-medium text-foreground">{weakest.label}</span> at{" "}
          {weakest.avgNet} avg net ({weakest.mocks} mock
          {weakest.mocks === 1 ? "" : "s"}).
        </p>
      )}

      <div className="panel overflow-hidden">
        <div className="table-head hidden border-b border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1.2fr)_repeat(3,auto)] sm:gap-3">
          <span>Subject</span>
          <span className="text-right">Avg net</span>
          <span className="text-right">Accuracy</span>
          <span className="text-right">Mocks</span>
        </div>
        {withData.map((section) => {
          const color = SUBJECT_COLORS[section.slug] ?? "var(--primary)";
          const isWeakest = weakest?.slug === section.slug;
          return (
            <div
              key={section.slug}
              className="grid grid-cols-2 gap-2 border-b border-border px-3 py-2.5 last:border-0 row-hover sm:grid-cols-[minmax(0,1.2fr)_repeat(3,auto)] sm:gap-3"
            >
              <div className="col-span-2 min-w-0 sm:col-span-1">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-sm font-medium">
                    {section.label}
                  </span>
                  {isWeakest && (
                    <span className="rounded-[3px] bg-tag-revise-bg px-1.5 py-0.5 text-[10px] font-medium text-tag-revise-fg">
                      Focus
                    </span>
                  )}
                </div>
              </div>
              <span className="stat-number text-sm sm:text-right">
                {section.avgNet}
              </span>
              <span className="stat-number text-sm text-muted-foreground sm:text-right">
                {section.accuracy}%
              </span>
              <span className="stat-number text-sm text-muted-foreground sm:text-right">
                {section.mocks}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <p className="mb-3 text-sm font-semibold">Avg net by subject</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid stroke={theme.grid} vertical={false} />
                <XAxis
                  dataKey="label"
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
                />
                <Bar
                  dataKey="avgNet"
                  radius={[3, 3, 0, 0]}
                  fill={theme.primary}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {lineData.length > 1 && (
          <div className="panel p-4">
            <p className="mb-3 text-sm font-semibold">Net score over time</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineData}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <CartesianGrid stroke={theme.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
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
                  />
                  <Legend wrapperStyle={{ color: theme.tick, fontSize: 12 }} />
                  {withData.map((section) => {
                    const color =
                      SUBJECT_COLORS[section.slug] ?? theme.primary;
                    return (
                      <Line
                        key={section.slug}
                        type="monotone"
                        dataKey={section.label}
                        stroke={color}
                        strokeWidth={2}
                        connectNulls
                        dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function shortLabel(name: string) {
  if (name.includes("Quantitative")) return "Quant";
  if (name.includes("Reasoning")) return "Reasoning";
  if (name.includes("English")) return "English";
  if (name.includes("Awareness")) return "GA";
  return name.split(" ")[0] ?? name;
}
