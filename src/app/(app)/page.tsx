import Link from "next/link";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { DailyPlan } from "@/components/dashboard/daily-plan";
import { MilestoneToasts } from "@/components/dashboard/milestone-toasts";
import { MotivationOverview } from "@/components/dashboard/motivation-overview";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { RevisionQueue } from "@/components/dashboard/revision-queue";
import { SubjectProgress } from "@/components/dashboard/subject-progress";
import { WeakTopics } from "@/components/dashboard/weak-topics";
import { getDashboardData } from "@/lib/data";
import {
  dailyPlan,
  detectMilestones,
  examPace,
  revisionQueue,
  subjectProgress,
  streakFromDays,
  weakTopics,
  weeklyProgress,
} from "@/lib/stats";

export default async function DashboardPage() {
  const { subjects, topics, sessions, settings, activityDates, study } =
    await getDashboardData();

  const { current: streak, longest } = streakFromDays(activityDates);
  const pace = examPace(topics, settings, activityDates);
  const week = weeklyProgress(topics, sessions, settings, study);
  const plan = dailyPlan({ topics, sessions, study, settings });
  const progress = subjectProgress(topics, subjects);
  const reviews = revisionQueue(topics);
  const weak = weakTopics(topics);
  const recent = sessions.slice(0, 8);
  const milestones = detectMilestones({
    topics,
    sessions,
    streak,
    subjects,
    seen: settings.seen_milestones,
  });

  return (
    <div className="space-y-8">
      <MilestoneToasts ids={milestones} subjects={subjects} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {streak > 0
              ? "Keep the streak alive — one session is enough today."
              : "Log a session or update a topic to start your streak."}
          </p>
        </div>
        <Link
          href="/settings"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Settings
        </Link>
      </div>

      <DailyPlan
        items={plan.items}
        doneCount={plan.doneCount}
        minutes={plan.minutes}
      />

      <MotivationOverview
        streak={streak}
        longest={longest}
        pace={pace}
        week={week}
      />

      <RevisionQueue due={reviews.due} upcoming={reviews.upcoming} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Subject progress</h2>
          <Link
            href="/syllabus"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Open syllabus
          </Link>
        </div>
        <SubjectProgress items={progress} topics={topics} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Practice activity</h2>
          <span className="text-xs text-muted-foreground">Last ~17 weeks</span>
        </div>
        <ActivityHeatmap sessions={sessions} />
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold">Weak topics</h2>
          <WeakTopics topics={weak} />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold">Recent sessions</h2>
          <RecentSessions sessions={recent} />
        </section>
      </div>
    </div>
  );
}
