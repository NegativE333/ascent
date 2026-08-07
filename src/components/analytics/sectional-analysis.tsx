"use client";

import { format, parseISO } from "date-fns";
import {
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
import { weakestSection, type SectionalStat } from "@/lib/stats";
import { SUBJECT_COLORS } from "@/lib/types";

export function SectionalAnalysis({ stats }: { stats: SectionalStat[] }) {
  const theme = useChartTheme();
  const withData = stats.filter((s) => s.mocks > 0);
  const weakest = weakestSection(stats);

  if (withData.length === 0) {
    return (
      <div className="panel px-4 py-8 text-center">
        <p className="text-sm font-medium">No sectional data yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Add per-section correct and wrong counts when logging a mock test to
          see which section is costing you marks.
        </p>
      </div>
    );
  }

  const dates = Array.from(
    new Set(withData.flatMap((s) => s.trend.map((p) => p.date)))
  ).sort();

  const chartData = dates.map((date) => {
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
          Weakest section is{" "}
          <span className="font-medium text-foreground">{weakest.label}</span> at{" "}
          {weakest.avgNet} net marks per mock and {weakest.accuracy}% accuracy
          {weakest.skipRate > 15
            ? `, leaving ${weakest.skipRate}% of questions unattempted.`
            : "."}
        </p>
      )}

      <div className="panel overflow-hidden">
        <div className="table-head hidden border-b border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1.2fr)_repeat(4,auto)] sm:gap-3">
          <span>Section</span>
          <span className="text-right">Avg net</span>
          <span className="text-right">Accuracy</span>
          <span className="text-right">Attempted</span>
          <span className="text-right">Mocks</span>
        </div>
        {withData.map((section) => {
          const color = SUBJECT_COLORS[section.slug] ?? "var(--primary)";
          const isWeakest = weakest?.slug === section.slug;
          return (
            <div
              key={section.slug}
              className="grid grid-cols-2 gap-2 border-b border-border px-3 py-2.5 last:border-0 row-hover sm:grid-cols-[minmax(0,1.2fr)_repeat(4,auto)] sm:gap-3"
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
                <div className="mt-1.5 h-1 overflow-hidden rounded-[2px] bg-track">
                  <div
                    className="h-full rounded-[2px]"
                    style={{
                      width: `${section.accuracy}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
              <span className="stat-number text-sm sm:text-right">
                {section.avgNet}
              </span>
              <span className="stat-number text-sm text-muted-foreground sm:text-right">
                {section.accuracy}%
              </span>
              <span className="stat-number text-sm text-muted-foreground sm:text-right">
                {section.avgAttempted}/{section.questions}
              </span>
              <span className="stat-number text-sm text-muted-foreground sm:text-right">
                {section.mocks}
              </span>
            </div>
          );
        })}
      </div>

      {chartData.length > 1 && (
        <div className="panel p-4">
          <p className="mb-3 text-sm font-semibold">Net marks per section</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
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
  );
}
