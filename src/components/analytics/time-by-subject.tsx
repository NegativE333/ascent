"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "@/hooks/use-chart-theme";
import { SUBJECT_COLORS } from "@/lib/types";

export function TimeBySubjectChart({
  data,
}: {
  data: { name: string; minutes: number; slug: string }[];
}) {
  const theme = useChartTheme();
  const hasData = data.some((d) => d.minutes > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Time invested shows up when you log session duration.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    short: d.name.split(" ")[0],
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis
            dataKey="short"
            tick={{ fill: theme.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: theme.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit="m"
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
            formatter={(value) => [`${value} min`, "Time"]}
            labelFormatter={(_, payload) =>
              (payload?.[0]?.payload?.name as string) ?? ""
            }
          />
          <Bar dataKey="minutes" radius={[3, 3, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.slug}
                fill={SUBJECT_COLORS[entry.slug] ?? theme.primary}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
