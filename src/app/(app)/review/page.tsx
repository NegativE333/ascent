import { WeeklyReviewPanel } from "@/components/review/weekly-review";
import { getDashboardData } from "@/lib/data";
import { weeklyReview } from "@/lib/stats";

export default async function ReviewPage() {
  const { topics, sessions, study, mocks, subjects, activityDates, settings } =
    await getDashboardData();

  const review = weeklyReview({
    topics,
    sessions,
    study,
    mocks,
    subjects,
    activityDates,
    settings,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Weekly review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What you actually did this week, and what slipped.
        </p>
      </div>
      <WeeklyReviewPanel review={review} />
    </div>
  );
}
