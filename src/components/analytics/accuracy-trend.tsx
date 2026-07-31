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
import { SUBJECT_COLORS } from "@/lib/types";

type Point = {
  date: string;
  subject: string;
  accuracy: number;
  net?: number;
  color: string;
};

export function AccuracyTrendChart({ points }: { points: Point[] }) {
  const theme = useChartTheme();

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Log practice across subjects to see accuracy trends.
      </div>
    );
  }

  const dates = Array.from(new Set(points.map((p) => p.date))).sort();
  const subjects = Array.from(new Set(points.map((p) => p.subject)));

  const data = dates.map((date) => {
    const row: Record<string, string | number> = {
      date: format(parseISO(date), "MMM d"),
    };
    for (const subject of subjects) {
      const hit = points.find((p) => p.date === date && p.subject === subject);
      if (hit) row[subject] = hit.accuracy;
    }
    return row;
  });

  const slugByName = new Map(points.map((p) => [p.subject, p.color]));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: theme.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: theme.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderRadius: 6,
              fontSize: 12,
              color: theme.tooltipText,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          />
          <Legend wrapperStyle={{ color: theme.tick, fontSize: 12 }} />
          {subjects.map((subject) => {
            const slug = slugByName.get(subject) ?? "";
            const color = SUBJECT_COLORS[slug] ?? theme.primary;
            return (
              <Line
                key={subject}
                type="monotone"
                dataKey={subject}
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
  );
}
