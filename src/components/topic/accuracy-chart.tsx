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
import { accuracy } from "@/lib/stats";
import type { McqSession } from "@/lib/types";

export function AccuracyChart({ sessions }: { sessions: McqSession[] }) {
  const theme = useChartTheme();

  if (sessions.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Accuracy trend appears after you log sessions.
      </div>
    );
  }

  const data = sessions.map((s) => ({
    date: format(parseISO(s.session_date), "MMM d"),
    accuracy: accuracy(s),
  }));

  return (
    <div className="h-56 w-full">
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
            formatter={(value) => [`${value}%`, "Accuracy"]}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke={theme.primary}
            strokeWidth={2}
            dot={{ r: 3, fill: theme.primary, strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
