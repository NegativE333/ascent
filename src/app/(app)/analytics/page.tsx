import { AccuracyTrendChart } from "@/components/analytics/accuracy-trend";
import { MockTestsPanel } from "@/components/analytics/mock-tests-panel";
import { ScoreProjectionPanel } from "@/components/analytics/score-projection";
import { SectionalAnalysis } from "@/components/analytics/sectional-analysis";
import { StreakCounter } from "@/components/analytics/streak-counter";
import { TimeBySubjectChart } from "@/components/analytics/time-by-subject";
import { getDashboardData } from "@/lib/data";
import {
  accuracyTrend,
  netScore,
  personalBests,
  projectedScore,
  sectionalPerformance,
  streakFromDays,
  timeBySubject,
} from "@/lib/stats";

export default async function AnalyticsPage() {
  const { subjects, topics, sessions, activityDates, mocks, settings, study } =
    await getDashboardData();
  const { current: streak, longest: best } = streakFromDays(activityDates);
  const trend = accuracyTrend(sessions, subjects, topics);
  const timeData = timeBySubject(sessions, subjects, topics, study);
  const bests = personalBests(sessions);
  const sectional = sectionalPerformance(mocks);
  const projection = projectedScore({
    topics,
    sessions,
    mocks,
    subjects,
    settings,
  });

  const totalMinutes = timeData.reduce((sum, d) => sum + d.minutes, 0);
  const totalQuestions = sessions.reduce((sum, s) => sum + s.total_questions, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_answers, 0);
  const overallAccuracy =
    totalQuestions === 0
      ? 0
      : Math.round((totalCorrect / totalQuestions) * 100);
  const overallNet =
    sessions.length === 0
      ? 0
      : Number(
          sessions
            .reduce((sum, s) => sum + netScore(s), 0)
            .toFixed(1)
        );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accuracy, net score (−0.5), mocks, and personal bests.
        </p>
      </div>

      <div className="flex flex-wrap items-stretch gap-0 border-y border-border">
        {[
          { label: "Overall accuracy", value: `${overallAccuracy}%` },
          { label: "Net score (sum)", value: `${overallNet}` },
          { label: "Questions", value: `${totalQuestions}` },
          { label: "Minutes", value: `${totalMinutes}` },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`flex min-w-[110px] flex-1 flex-col justify-center px-4 py-4 ${
              i > 0 ? "border-l border-border" : ""
            }`}
          >
            <span className="stat-number text-2xl font-semibold">
              {stat.value}
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Personal bests</h2>
        <div className="flex flex-wrap items-stretch gap-0 border-y border-border">
          {[
            { label: "Most MCQs in a day", value: bests.mostMcqsInDay },
            {
              label: "Best session accuracy",
              value: `${bests.bestSessionAccuracy}%`,
            },
            { label: "Best net score", value: bests.bestNetScore },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex min-w-[120px] flex-1 flex-col justify-center px-4 py-3 ${
                i > 0 ? "border-l border-border" : ""
              }`}
            >
              <span className="stat-number text-xl font-semibold">
                {stat.value}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Practice streak</h2>
        <StreakCounter current={streak} longest={best} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Accuracy by subject</h2>
        <div className="panel p-4">
          <AccuracyTrendChart points={trend} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Time invested per subject</h2>
        <div className="panel p-4">
          <TimeBySubjectChart data={timeData} />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold">Score projection</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Where you'd land today on Tier 1 marking (+2 correct, −0.5 wrong).
        </p>
        <ScoreProjectionPanel projection={projection} />
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold">Sectional performance</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Where your mock marks are won and lost.
        </p>
        <SectionalAnalysis stats={sectional} />
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold">Mock tests</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Full-length mocks — separate from topic-wise MCQ practice.
        </p>
        <MockTestsPanel mocks={mocks} />
      </section>
    </div>
  );
}
