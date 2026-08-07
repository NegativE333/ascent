"use client";

import { useState, useTransition } from "react";
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
import { toast } from "sonner";
import { createMockTest, deleteMockTest } from "@/lib/actions";
import { useChartTheme } from "@/hooks/use-chart-theme";
import { mockScoreTrend } from "@/lib/stats";
import { MOCK_SECTIONS, type MockTest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SectionInput = { correct: string; wrong: string };

const emptySections: Record<string, SectionInput> = Object.fromEntries(
  MOCK_SECTIONS.map((s) => [s.slug, { correct: "", wrong: "" }])
);

export function MockTestsPanel({ mocks }: { mocks: MockTest[] }) {
  const theme = useChartTheme();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [total, setTotal] = useState("100");
  const [correct, setCorrect] = useState("70");
  const [wrong, setWrong] = useState("30");
  const [percentile, setPercentile] = useState("");
  const [sections, setSections] = useState(emptySections);
  const [showSections, setShowSections] = useState(false);
  const trend = mockScoreTrend(mocks);

  const sectionTotals = MOCK_SECTIONS.reduce(
    (acc, s) => {
      acc.correct += Number(sections[s.slug]?.correct || 0);
      acc.wrong += Number(sections[s.slug]?.wrong || 0);
      return acc;
    },
    { correct: 0, wrong: 0 }
  );
  const hasSectionData = sectionTotals.correct + sectionTotals.wrong > 0;

  function setSection(slug: string, field: keyof SectionInput, value: string) {
    setSections((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: value },
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const totalQuestions = Number(total);
    // Section entries are the source of truth when provided
    const c = hasSectionData ? sectionTotals.correct : Number(correct);
    const w = hasSectionData ? sectionTotals.wrong : Number(wrong);

    if (!name || !totalQuestions || c + w > totalQuestions) {
      toast.error("Check mock test fields");
      return;
    }

    const breakdown = hasSectionData
      ? Object.fromEntries(
          MOCK_SECTIONS.map((s) => [
            s.slug,
            {
              correct: Number(sections[s.slug]?.correct || 0),
              wrong: Number(sections[s.slug]?.wrong || 0),
            },
          ])
        )
      : null;

    startTransition(async () => {
      try {
        await createMockTest({
          name,
          totalQuestions,
          correct: c,
          wrong: w,
          percentile: percentile ? Number(percentile) : null,
          sectionalBreakdown: breakdown,
        });
        setName("");
        setSections(emptySections);
        toast.success("Mock test logged");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      {trend.length > 0 && (
        <div className="panel p-4">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trend.map((p) => ({
                  ...p,
                  label: format(parseISO(p.date), "MMM d"),
                }))}
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
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={theme.primary}
                  strokeWidth={2}
                  dot={{ r: 3, fill: theme.primary, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="panel overflow-hidden">
        {mocks.length === 0 ? (
          <p className="px-3 py-6 text-sm text-muted-foreground">
            No mock tests yet. Log full-length mocks separately from topic MCQs.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="table-head border-b border-border text-[11px] text-muted-foreground">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Score</th>
                <th className="px-3 py-2 font-medium">%ile</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {mocks.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {format(parseISO(m.test_date), "MMM d")}
                  </td>
                  <td className="px-3 py-2">{m.name}</td>
                  <td className="stat-number px-3 py-2">
                    {m.score ?? m.correct - 0.5 * m.wrong}
                  </td>
                  <td className="stat-number px-3 py-2 text-muted-foreground">
                    {m.percentile ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        startTransition(async () => {
                          await deleteMockTest(m.id);
                        })
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form
        onSubmit={submit}
        className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2"
      >
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Mock name / source</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Testbook Mock 12"
            className="h-8 shadow-none"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Total</Label>
          <Input
            type="number"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="h-8 shadow-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Correct</Label>
          <Input
            type="number"
            value={hasSectionData ? String(sectionTotals.correct) : correct}
            onChange={(e) => setCorrect(e.target.value)}
            disabled={hasSectionData}
            className="h-8 shadow-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Wrong</Label>
          <Input
            type="number"
            value={hasSectionData ? String(sectionTotals.wrong) : wrong}
            onChange={(e) => setWrong(e.target.value)}
            disabled={hasSectionData}
            className="h-8 shadow-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Percentile (optional)</Label>
          <Input
            type="number"
            value={percentile}
            onChange={(e) => setPercentile(e.target.value)}
            className="h-8 shadow-none"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <button
            type="button"
            onClick={() => setShowSections((v) => !v)}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            {showSections
              ? "Hide sectional breakdown"
              : "Add sectional breakdown (unlocks section analysis)"}
          </button>

          {showSections && (
            <div className="space-y-2 rounded-md border border-border p-3">
              {MOCK_SECTIONS.map((section) => (
                <div
                  key={section.slug}
                  className="grid grid-cols-[minmax(0,1fr)_72px_72px] items-center gap-2"
                >
                  <Label className="text-xs font-normal text-muted-foreground">
                    {section.label}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={section.questions}
                    placeholder="right"
                    value={sections[section.slug]?.correct ?? ""}
                    onChange={(e) =>
                      setSection(section.slug, "correct", e.target.value)
                    }
                    className="h-7 text-xs shadow-none"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={section.questions}
                    placeholder="wrong"
                    value={sections[section.slug]?.wrong ?? ""}
                    onChange={(e) =>
                      setSection(section.slug, "wrong", e.target.value)
                    }
                    className="h-7 text-xs shadow-none"
                  />
                </div>
              ))}
              {hasSectionData && (
                <p className="text-[11px] text-muted-foreground">
                  Totals come from these sections: {sectionTotals.correct} right,{" "}
                  {sectionTotals.wrong} wrong.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Log mock test"}
          </Button>
        </div>
      </form>
    </div>
  );
}
