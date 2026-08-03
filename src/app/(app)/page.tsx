import Link from "next/link";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { MilestoneToasts } from "@/components/dashboard/milestone-toasts";
import { MotivationOverview } from "@/components/dashboard/motivation-overview";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { SubjectProgress } from "@/components/dashboard/subject-progress";
import { TodaysFocus } from "@/components/dashboard/todays-focus";
import { WeakTopics } from "@/components/dashboard/weak-topics";
import { getDashboardData } from "@/lib/data";
import {
  detectMilestones,
  examPace,
  subjectProgress,
  streakFromDays,
  todaysFocus,
  weakTopics,
  weeklyProgress,
} from "@/lib/stats";

export default async function DashboardPage() {
  const { subjects, topics, sessions, settings, activityDates } =
    await getDashboardData();

  const { current: streak, longest } = streakFromDays(activityDates);
  const focus = todaysFocus(topics);
  const pace = examPace(topics, settings, activityDates);
  const week = weeklyProgress(topics, sessions, settings);
  const progress = subjectProgress(topics, subjects);
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

      <MotivationOverview
        streak={streak}
        longest={longest}
        pace={pace}
        week={week}
      />

      <TodaysFocus revise={focus.revise} next={focus.next} />

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
