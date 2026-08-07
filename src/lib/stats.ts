import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
  subDays,
} from "date-fns";
import type {
  McqSession,
  MockTest,
  StudySession,
  Subject,
  Topic,
  TopicWithSubject,
  UserSettings,
} from "@/lib/types";
import {
  CONFIDENCE_INTERVAL_FACTOR,
  MOCK_SECTIONS,
  REVIEW_INTERVALS,
} from "@/lib/types";

/** Used when a topic predates the seeded time estimates. */
const FALLBACK_TOPIC_MINUTES = 60;

/** Estimated study time for one topic, in minutes. */
export function topicMinutes(topic: Pick<Topic, "estimated_minutes">): number {
  return topic.estimated_minutes > 0
    ? topic.estimated_minutes
    : FALLBACK_TOPIC_MINUTES;
}

function totalMinutes(topics: Pick<Topic, "estimated_minutes">[]): number {
  return topics.reduce((sum, t) => sum + topicMinutes(t), 0);
}

export function hoursLabel(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`;
}

/**
 * Progress by study time rather than topic count, since a 20-minute GA fact and
 * an 8-hour Geometry chapter are not the same unit of work.
 */
export type WeightedProgress = {
  done: number;
  total: number;
  percent: number;
  doneMinutes: number;
  totalMinutes: number;
  remainingMinutes: number;
};

export function topicsProgress(topics: Topic[]): WeightedProgress {
  const doneTopics = topics.filter((t) => t.status === "done");
  const total = totalMinutes(topics);
  const doneMins = totalMinutes(doneTopics);

  return {
    done: doneTopics.length,
    total: topics.length,
    percent: total === 0 ? 0 : Math.round((doneMins / total) * 100),
    doneMinutes: doneMins,
    totalMinutes: total,
    remainingMinutes: total - doneMins,
  };
}

export function completionPercent(topics: Topic[]): number {
  return topicsProgress(topics).percent;
}

export function subjectProgress(
  topics: Topic[],
  subjects: Subject[]
): ({ subject: Subject } & WeightedProgress)[] {
  return subjects
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((subject) => ({
      subject,
      ...topicsProgress(topics.filter((t) => t.subject_id === subject.id)),
    }));
}

export type SectionProgress = { section: string } & WeightedProgress;

/** Progress per main topic/section within a subject (e.g. Geography under GA). */
export function sectionProgress(
  topics: Topic[],
  sectionOrder?: readonly string[]
): SectionProgress[] {
  const bySection = new Map<string, Topic[]>();
  for (const t of topics) {
    const key = t.section?.trim() || "Other";
    const list = bySection.get(key) ?? [];
    list.push(t);
    bySection.set(key, list);
  }

  const names = sectionOrder
    ? [
        ...sectionOrder.filter((s) => bySection.has(s)),
        ...[...bySection.keys()]
          .filter((s) => !sectionOrder.includes(s))
          .sort(),
      ]
    : [...bySection.keys()].sort();

  return names.map((section) => ({
    section,
    ...topicsProgress(bySection.get(section) ?? []),
  }));
}

export function weakTopics(topics: TopicWithSubject[]): TopicWithSubject[] {
  return topics
    .filter((t) => t.confidence <= 2 && t.last_practiced_at != null)
    .sort((a, b) => a.confidence - b.confidence);
}

export function accuracy(
  session: Pick<McqSession, "correct_answers" | "total_questions">
) {
  if (session.total_questions === 0) return 0;
  return Math.round((session.correct_answers / session.total_questions) * 100);
}

/** SSC CGL net score: +1 correct, −0.5 wrong */
export function netScore(
  session: Pick<McqSession, "correct_answers" | "total_questions">
) {
  const wrong = session.total_questions - session.correct_answers;
  return Number((session.correct_answers - 0.5 * wrong).toFixed(1));
}

export function buildHeatmap(
  sessions: McqSession[],
  days = 119
): { date: string; count: number; questions: number }[] {
  const end = new Date();
  const map = new Map<string, { count: number; questions: number }>();

  for (let i = 0; i < days; i++) {
    const d = format(subDays(end, days - 1 - i), "yyyy-MM-dd");
    map.set(d, { count: 0, questions: 0 });
  }

  for (const s of sessions) {
    const key = s.session_date;
    if (!map.has(key)) continue;
    const cur = map.get(key)!;
    cur.count += 1;
    cur.questions += s.total_questions;
  }

  return Array.from(map.entries()).map(([date, v]) => ({
    date,
    count: v.count,
    questions: v.questions,
  }));
}

export function streakFromDays(activityDates: string[]): {
  current: number;
  longest: number;
} {
  if (activityDates.length === 0) return { current: 0, longest: 0 };

  const days = Array.from(new Set(activityDates)).sort();
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const set = new Set(days);

  let cursor: string | null = null;
  if (set.has(today)) cursor = today;
  else if (set.has(yesterday)) cursor = yesterday;

  let current = 0;
  if (cursor) {
    let d = parseISO(cursor);
    while (set.has(format(d, "yyyy-MM-dd"))) {
      current += 1;
      d = subDays(d, 1);
    }
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = differenceInCalendarDays(parseISO(days[i]), parseISO(days[i - 1]));
    if (gap === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

export function currentStreak(sessions: McqSession[]): number {
  return streakFromDays(sessions.map((s) => s.session_date)).current;
}

export function longestStreak(sessions: McqSession[]): number {
  return streakFromDays(sessions.map((s) => s.session_date)).longest;
}

/** Days to wait before the next review, from review stage + confidence. */
export function reviewInterval(topic: Pick<Topic, "review_count" | "confidence">) {
  const stage = Math.min(
    Math.max(topic.review_count, 0),
    REVIEW_INTERVALS.length - 1
  );
  const base = REVIEW_INTERVALS[stage];
  const factor = CONFIDENCE_INTERVAL_FACTOR[topic.confidence] ?? 1;
  return Math.max(1, Math.round(base * factor));
}

/** Last time the topic was touched in a way that counts as studying it. */
function lastStudiedAt(topic: Topic): Date | null {
  const candidates = [
    topic.last_revised_at,
    topic.last_practiced_at,
    topic.status === "done" ? topic.status_updated_at : null,
  ].filter((d): d is string => Boolean(d));

  if (candidates.length === 0) return null;
  return candidates
    .map((d) => parseISO(d))
    .reduce((latest, d) => (d > latest ? d : latest));
}

export type ReviewItem = {
  topic: TopicWithSubject;
  intervalDays: number;
  dueDate: string;
  /** Positive when late, 0 when due today, negative when still scheduled. */
  daysOverdue: number;
  stage: number;
};

/** Every started topic with its next scheduled review, soonest due first. */
export function reviewSchedule(topics: TopicWithSubject[]): ReviewItem[] {
  const today = new Date();

  return topics
    .filter((t) => t.status !== "not_started")
    .flatMap((topic) => {
      const studied = lastStudiedAt(topic);
      if (!studied) return [];

      const intervalDays = reviewInterval(topic);
      const due = addDays(studied, intervalDays);

      return [
        {
          topic,
          intervalDays,
          dueDate: format(due, "yyyy-MM-dd"),
          daysOverdue: differenceInCalendarDays(today, due),
          stage: Math.min(topic.review_count, REVIEW_INTERVALS.length - 1),
        },
      ];
    })
    .sort((a, b) => {
      if (b.daysOverdue !== a.daysOverdue) return b.daysOverdue - a.daysOverdue;
      return a.topic.confidence - b.topic.confidence;
    });
}

export function needsRevision(topic: Topic): boolean {
  if (topic.status === "not_started") return false;
  const studied = lastStudiedAt(topic);
  if (!studied) return false;
  const due = addDays(studied, reviewInterval(topic));
  return differenceInCalendarDays(new Date(), due) >= 0;
}

export function revisionQueue(topics: TopicWithSubject[]): {
  due: ReviewItem[];
  upcoming: ReviewItem[];
} {
  const schedule = reviewSchedule(topics);
  return {
    due: schedule.filter((i) => i.daysOverdue >= 0),
    upcoming: schedule
      .filter((i) => i.daysOverdue < 0)
      .sort((a, b) => b.daysOverdue - a.daysOverdue),
  };
}

export function revisionTopics(topics: TopicWithSubject[]): TopicWithSubject[] {
  return revisionQueue(topics).due.map((i) => i.topic);
}

const priorityRank = { high: 0, medium: 1, low: 2 };

export function todaysFocus(topics: TopicWithSubject[]): {
  revise: TopicWithSubject[];
  next: TopicWithSubject | null;
} {
  const revise = revisionTopics(topics).slice(0, 2);
  const next =
    topics
      .filter((t) => t.status === "not_started")
      .sort((a, b) => {
        const pr = priorityRank[a.priority] - priorityRank[b.priority];
        if (pr !== 0) return pr;
        return a.name.localeCompare(b.name);
      })[0] ?? null;

  return { revise, next };
}

export type PaceStatus =
  | "no_exam"
  | "done"
  | "no_data"
  | "on_pace"
  | "behind"
  | "ahead";

export type PaceProjection = {
  /** Study hours per week this projection extrapolates from. */
  hoursPerWeek: number;
  projectedDate: string;
  /** Days between the projected finish and the exam; positive means too late. */
  daysDelta: number;
  status: "on_pace" | "behind" | "ahead";
};

export type ExamPace = {
  daysLeft: number | null;
  status: PaceStatus;
  /** Assumes you study every day from now on — the best case. */
  ifDaily: PaceProjection | null;
  /** Extrapolates your real calendar rate, rest days included. */
  atCurrentHabits: PaceProjection | null;
  /** How many days a week you actually show up, on average. */
  studyDaysPerWeek: number;
  /** Estimated study time still ahead of you. */
  remainingMinutes: number;
  remainingTopics: number;
};

function project(
  remainingHours: number,
  hoursPerWeek: number,
  examDate: string
): PaceProjection | null {
  if (hoursPerWeek <= 0) return null;

  const projected = addDays(
    new Date(),
    Math.ceil((remainingHours / hoursPerWeek) * 7)
  );
  const daysDelta = differenceInCalendarDays(projected, parseISO(examDate));

  let status: "on_pace" | "behind" | "ahead" = "on_pace";
  if (daysDelta > 3) status = "behind";
  else if (daysDelta < -3) status = "ahead";

  return {
    hoursPerWeek: Number(hoursPerWeek.toFixed(1)),
    projectedDate: format(projected, "yyyy-MM-dd"),
    daysDelta,
    status,
  };
}

export function examPace(
  topics: Topic[],
  settings: UserSettings | null,
  activityDates: string[]
): ExamPace {
  const progress = topicsProgress(topics);
  const remainingTopics = progress.total - progress.done;
  const daysLeft = settings?.exam_date
    ? differenceInCalendarDays(parseISO(settings.exam_date), new Date())
    : null;

  const empty: ExamPace = {
    daysLeft,
    status: "no_data",
    ifDaily: null,
    atCurrentHabits: null,
    studyDaysPerWeek: 0,
    remainingMinutes: progress.remainingMinutes,
    remainingTopics,
  };

  if (remainingTopics === 0) return { ...empty, status: "done" };
  if (!settings?.exam_date) return { ...empty, status: "no_exam" };

  const activeDays = new Set(activityDates).size;
  if (progress.doneMinutes === 0 || activeDays === 0) return empty;

  // Weighted by estimated study time, so 15 quick GA facts no longer count the
  // same as 15 Quant chapters.
  const doneHours = progress.doneMinutes / 60;
  const remainingHours = progress.remainingMinutes / 60;

  // Best case: rate measured per seven days of actual studying.
  const dailyRate = doneHours / Math.max(activeDays / 7, 1 / 7);

  // Realistic: same work spread over the calendar time it really took.
  const firstActive = activityDates.slice().sort()[0];
  const elapsedDays =
    differenceInCalendarDays(new Date(), parseISO(firstActive)) + 1;
  const calendarWeeks = Math.max(1, elapsedDays / 7);
  const habitRate = doneHours / calendarWeeks;

  const atCurrentHabits = project(
    remainingHours,
    habitRate,
    settings.exam_date
  );

  return {
    daysLeft,
    status: atCurrentHabits?.status ?? "no_data",
    ifDaily: project(remainingHours, dailyRate, settings.exam_date),
    atCurrentHabits,
    studyDaysPerWeek: Number(
      Math.min(7, activeDays / calendarWeeks).toFixed(1)
    ),
    remainingMinutes: progress.remainingMinutes,
    remainingTopics,
  };
}

export function weeklyProgress(
  topics: Topic[],
  sessions: McqSession[],
  settings: UserSettings | null,
  study: StudySession[] = []
) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const topicsThisWeek = topics.filter((t) => {
    if (!t.status_updated_at) return false;
    if (t.status !== "done" && t.status !== "in_progress") return false;
    return parseISO(t.status_updated_at) >= weekStart;
  }).length;

  const weekSessions = sessions.filter(
    (s) => parseISO(s.session_date) >= weekStart
  );
  const mcqsThisWeek = weekSessions.reduce(
    (sum, s) => sum + s.total_questions,
    0
  );
  const minutesThisWeek =
    weekSessions.reduce((sum, s) => sum + (s.time_taken_minutes ?? 0), 0) +
    study
      .filter((s) => parseISO(s.session_date) >= weekStart)
      .reduce((sum, s) => sum + s.minutes, 0);

  const targetTopics = settings?.weekly_target_topics ?? 3;
  const targetMcqs = settings?.weekly_target_mcqs ?? 100;

  return {
    topicsThisWeek,
    mcqsThisWeek,
    minutesThisWeek,
    targetTopics,
    targetMcqs,
    topicsPct: Math.min(100, Math.round((topicsThisWeek / targetTopics) * 100)),
    mcqsPct: Math.min(100, Math.round((mcqsThisWeek / targetMcqs) * 100)),
  };
}

export type WeekTotals = {
  daysStudied: number;
  minutes: number;
  questions: number;
  accuracy: number;
  mocks: number;
};

export type WeeklyReview = {
  weekStart: string;
  weekEnd: string;
  current: WeekTotals;
  previous: WeekTotals;
  /** Only the current week — status history isn't retained per change. */
  topicsCompleted: number;
  revisions: number;
  hoursNeededPerWeek: number;
  subjectMinutes: { name: string; slug: string; minutes: number }[];
  neglected: { name: string; slug: string }[];
};

function weekTotals(
  input: {
    sessions: McqSession[];
    study: StudySession[];
    mocks: MockTest[];
    activityDates: string[];
  },
  start: Date,
  end: Date
): WeekTotals {
  const within = (iso: string) => {
    const d = parseISO(iso);
    return d >= start && d <= end;
  };

  const sessions = input.sessions.filter((s) => within(s.session_date));
  const study = input.study.filter((s) => within(s.session_date));
  const questions = sessions.reduce((n, s) => n + s.total_questions, 0);
  const correct = sessions.reduce((n, s) => n + s.correct_answers, 0);

  return {
    daysStudied: new Set(input.activityDates.filter(within)).size,
    minutes:
      sessions.reduce((n, s) => n + (s.time_taken_minutes ?? 0), 0) +
      study.reduce((n, s) => n + s.minutes, 0),
    questions,
    accuracy: questions === 0 ? 0 : Math.round((correct / questions) * 100),
    mocks: input.mocks.filter((m) => within(m.test_date)).length,
  };
}

/** This week against last week, plus what slipped. */
export function weeklyReview(input: {
  topics: TopicWithSubject[];
  sessions: McqSession[];
  study: StudySession[];
  mocks: MockTest[];
  subjects: Subject[];
  activityDates: string[];
  settings: UserSettings | null;
}): WeeklyReview {
  const { topics, sessions, study, mocks, subjects, activityDates, settings } =
    input;

  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = addDays(start, 6);
  const prevStart = subDays(start, 7);
  const prevEnd = subDays(start, 1);

  const source = { sessions, study, mocks, activityDates };
  const inWeek = (iso: string | null) => {
    if (!iso) return false;
    const d = parseISO(iso.slice(0, 10));
    return d >= start && d <= end;
  };

  const subjectMinutes = timeBySubject(
    sessions.filter((s) => inWeek(s.session_date)),
    subjects,
    topics,
    study.filter((s) => inWeek(s.session_date))
  );

  return {
    weekStart: format(start, "yyyy-MM-dd"),
    weekEnd: format(end, "yyyy-MM-dd"),
    current: weekTotals(source, start, end),
    previous: weekTotals(source, prevStart, prevEnd),
    topicsCompleted: topics.filter(
      (t) => t.status === "done" && inWeek(t.status_updated_at)
    ).length,
    revisions: topics.filter((t) => inWeek(t.last_revised_at)).length,
    hoursNeededPerWeek: suggestWeeklyTargets(topics, settings).hoursPerWeek,
    subjectMinutes,
    neglected: subjectMinutes
      .filter((s) => s.minutes === 0)
      .map(({ name, slug }) => ({ name, slug })),
  };
}

const REVISE_BLOCK_MINUTES = 15;
const STUDY_BLOCK_MINUTES = 45;

export type DailyPlanItem = {
  id: string;
  kind: "revise" | "study" | "practice";
  title: string;
  detail: string;
  href: string | null;
  minutes: number;
  done: boolean;
};

/**
 * A short, fixed list that defines "done for today". Completion is derived from
 * what you actually logged, so there's no separate checklist to keep in sync.
 */
export function dailyPlan(input: {
  topics: TopicWithSubject[];
  sessions: McqSession[];
  study: StudySession[];
  settings: UserSettings | null;
}): { items: DailyPlanItem[]; doneCount: number; minutes: number } {
  const { topics, sessions, study, settings } = input;
  const today = format(new Date(), "yyyy-MM-dd");
  const isToday = (iso: string | null) =>
    Boolean(iso && iso.slice(0, 10) === today);

  const items: DailyPlanItem[] = [];

  // Revisions — show ones already cleared today so the list stays stable
  const revisedToday = topics.filter((t) => isToday(t.last_revised_at));
  const due = revisionQueue(topics).due;

  for (const topic of revisedToday.slice(0, 2)) {
    items.push({
      id: `revise-${topic.id}`,
      kind: "revise",
      title: `Revise ${topic.name}`,
      detail: topic.subjects?.name ?? "",
      href: `/syllabus/${topic.id}`,
      minutes: REVISE_BLOCK_MINUTES,
      done: true,
    });
  }
  for (const item of due.slice(0, Math.max(0, 2 - items.length))) {
    items.push({
      id: `revise-${item.topic.id}`,
      kind: "revise",
      title: `Revise ${item.topic.name}`,
      detail:
        item.daysOverdue > 0
          ? `${item.daysOverdue} days late · ${item.topic.subjects?.name}`
          : `Due today · ${item.topic.subjects?.name}`,
      href: `/syllabus/${item.topic.id}`,
      minutes: REVISE_BLOCK_MINUTES,
      done: false,
    });
  }

  // One topic to move forward
  const studiedTodayIds = new Set([
    ...study.filter((s) => s.session_date === today).map((s) => s.topic_id),
    ...sessions.filter((s) => s.session_date === today).map((s) => s.topic_id),
  ]);
  const studiedToday = topics.find((t) => studiedTodayIds.has(t.id));

  const nextTopic =
    studiedToday ??
    topics
      .filter((t) => t.status === "in_progress")
      .sort(
        (a, b) =>
          a.confidence - b.confidence ||
          priorityRank[a.priority] - priorityRank[b.priority]
      )[0] ??
    topics
      .filter((t) => t.status === "not_started")
      .sort(
        (a, b) =>
          priorityRank[a.priority] - priorityRank[b.priority] ||
          a.display_order - b.display_order
      )[0];

  if (nextTopic) {
    items.push({
      id: `study-${nextTopic.id}`,
      kind: "study",
      title: studiedToday
        ? `Studied ${nextTopic.name}`
        : `Study ${nextTopic.name}`,
      detail: `${nextTopic.subjects?.name} · ~${hoursLabel(topicMinutes(nextTopic))} total`,
      href: `/syllabus/${nextTopic.id}`,
      minutes: Math.min(STUDY_BLOCK_MINUTES, topicMinutes(nextTopic)),
      done: Boolean(studiedToday),
    });
  }

  // Daily share of the weekly question target
  const goal = Math.max(
    10,
    Math.ceil((settings?.weekly_target_mcqs ?? 100) / 7)
  );
  const answered = sessions
    .filter((s) => s.session_date === today)
    .reduce((sum, s) => sum + s.total_questions, 0);

  items.push({
    id: "practice",
    kind: "practice",
    title: `Practice ${goal} questions`,
    detail:
      answered >= goal
        ? `${answered} logged today`
        : `${answered}/${goal} logged today`,
    href: "/syllabus",
    minutes: goal,
    done: answered >= goal,
  });

  return {
    items,
    doneCount: items.filter((i) => i.done).length,
    minutes: items.reduce((sum, i) => sum + i.minutes, 0),
  };
}

export function suggestWeeklyTargets(
  topicList: Topic[],
  settings: UserSettings | null
): { topics: number; mcqs: number; hoursPerWeek: number } {
  const pending = topicList.filter((t) => t.status !== "done");
  if (!settings?.exam_date || pending.length === 0) {
    return { topics: 3, mcqs: 100, hoursPerWeek: 0 };
  }

  const daysLeft = Math.max(
    1,
    differenceInCalendarDays(parseISO(settings.exam_date), new Date())
  );
  const weeksLeft = Math.max(1, daysLeft / 7);

  // Derive the target from remaining study hours, then convert back to a topic
  // count using the average length of what's actually left.
  const remainingMinutes = totalMinutes(pending);
  const minutesPerWeek = remainingMinutes / weeksLeft;
  const avgTopicMinutes = remainingMinutes / pending.length;
  const topicTarget = Math.max(2, Math.ceil(minutesPerWeek / avgTopicMinutes));

  return {
    topics: Math.min(topicTarget, 20),
    mcqs: Math.min(topicTarget * 40, 250),
    hoursPerWeek: Number((minutesPerWeek / 60).toFixed(1)),
  };
}

export function personalBests(sessions: McqSession[]): {
  mostMcqsInDay: number;
  bestSessionAccuracy: number;
  bestNetScore: number;
} {
  if (sessions.length === 0) {
    return { mostMcqsInDay: 0, bestSessionAccuracy: 0, bestNetScore: 0 };
  }

  const byDay = new Map<string, number>();
  let bestAcc = 0;
  let bestNet = -Infinity;

  for (const s of sessions) {
    byDay.set(
      s.session_date,
      (byDay.get(s.session_date) ?? 0) + s.total_questions
    );
    bestAcc = Math.max(bestAcc, accuracy(s));
    bestNet = Math.max(bestNet, netScore(s));
  }

  return {
    mostMcqsInDay: Math.max(...byDay.values()),
    bestSessionAccuracy: bestAcc,
    bestNetScore: bestNet === -Infinity ? 0 : bestNet,
  };
}

export function detectMilestones(input: {
  topics: Topic[];
  sessions: McqSession[];
  streak: number;
  subjects: Subject[];
  seen: string[];
}): string[] {
  const { topics, sessions, streak, subjects, seen } = input;
  const seenSet = new Set(seen);
  const next: string[] = [];

  const doneCount = topics.filter((t) => t.status === "done").length;
  if (doneCount >= 1 && !seenSet.has("first_topic")) {
    next.push("first_topic");
  }
  if (streak >= 7 && !seenSet.has("streak_7")) {
    next.push("streak_7");
  }
  if (sessions.length >= 50 && !seenSet.has("sessions_50")) {
    next.push("sessions_50");
  }

  for (const subject of subjects) {
    const key = `subject_done_${subject.slug}`;
    if (seenSet.has(key)) continue;
    const st = topics.filter((t) => t.subject_id === subject.id);
    if (st.length > 0 && st.every((t) => t.status === "done")) {
      next.push(key);
    }
  }

  return next;
}

export const MILESTONE_MESSAGES: Record<string, string> = {
  first_topic: "First topic completed.",
  streak_7: "7-day streak — consistency is building.",
  sessions_50: "50 practice sessions logged.",
};

export function milestoneMessage(id: string, subjects: Subject[]): string {
  if (MILESTONE_MESSAGES[id]) return MILESTONE_MESSAGES[id];
  if (id.startsWith("subject_done_")) {
    const slug = id.replace("subject_done_", "");
    const name = subjects.find((s) => s.slug === slug)?.name ?? "A subject";
    return `${name} fully completed.`;
  }
  return "Milestone reached.";
}

export function accuracyTrend(
  sessions: McqSession[],
  subjects: Subject[],
  topics: Topic[]
): {
  date: string;
  subject: string;
  accuracy: number;
  net: number;
  color: string;
}[] {
  const topicSubject = new Map(topics.map((t) => [t.id, t.subject_id]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const byDaySubject = new Map<
    string,
    { correct: number; total: number }
  >();

  for (const s of sessions) {
    const subjectId = topicSubject.get(s.topic_id);
    if (!subjectId) continue;
    const key = `${s.session_date}__${subjectId}`;
    const cur = byDaySubject.get(key) ?? { correct: 0, total: 0 };
    cur.correct += s.correct_answers;
    cur.total += s.total_questions;
    byDaySubject.set(key, cur);
  }

  const points: {
    date: string;
    subject: string;
    accuracy: number;
    net: number;
    color: string;
  }[] = [];

  for (const [key, v] of byDaySubject) {
    const [date, subjectId] = key.split("__");
    const subject = subjectMap.get(subjectId);
    if (!subject || v.total === 0) continue;
    const wrong = v.total - v.correct;
    points.push({
      date,
      subject: subject.name,
      accuracy: Math.round((v.correct / v.total) * 100),
      net: Number((v.correct - 0.5 * wrong).toFixed(1)),
      color: subject.slug,
    });
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

export function timeBySubject(
  sessions: McqSession[],
  subjects: Subject[],
  topics: Topic[],
  study: StudySession[] = []
): { name: string; minutes: number; slug: string }[] {
  const topicSubject = new Map(topics.map((t) => [t.id, t.subject_id]));
  const totals = new Map<string, number>();

  for (const s of sessions) {
    const subjectId = topicSubject.get(s.topic_id);
    if (!subjectId) continue;
    totals.set(
      subjectId,
      (totals.get(subjectId) ?? 0) + (s.time_taken_minutes ?? 0)
    );
  }

  for (const s of study) {
    const subjectId = topicSubject.get(s.topic_id);
    if (!subjectId) continue;
    totals.set(subjectId, (totals.get(subjectId) ?? 0) + s.minutes);
  }

  return subjects
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((s) => ({
      name: s.name,
      slug: s.slug,
      minutes: totals.get(s.id) ?? 0,
    }));
}

export function mockScoreTrend(
  mocks: MockTest[]
): { date: string; score: number; name: string }[] {
  return mocks
    .slice()
    .sort((a, b) => a.test_date.localeCompare(b.test_date))
    .map((m) => ({
      date: m.test_date,
      score:
        m.score ??
        Number((m.correct - 0.5 * m.wrong).toFixed(1)),
      name: m.name,
    }));
}

export type SectionalStat = {
  slug: string;
  label: string;
  questions: number;
  mocks: number;
  correct: number;
  wrong: number;
  attempted: number;
  /** Correct out of attempted. */
  accuracy: number;
  /** Average net marks per mock (+1 correct, −0.5 wrong). */
  avgNet: number;
  avgAttempted: number;
  /** Share of the section left unattempted, averaged across mocks. */
  skipRate: number;
  trend: { date: string; net: number; accuracy: number; name: string }[];
};

/** Per-section performance across every mock that has a sectional breakdown. */
export function sectionalPerformance(mocks: MockTest[]): SectionalStat[] {
  const scored = mocks
    .filter((m) => m.sectional_breakdown)
    .sort((a, b) => a.test_date.localeCompare(b.test_date));

  return MOCK_SECTIONS.map((section) => {
    let correct = 0;
    let wrong = 0;
    let count = 0;
    const trend: SectionalStat["trend"] = [];

    for (const mock of scored) {
      const row = mock.sectional_breakdown?.[section.slug];
      if (!row) continue;

      correct += row.correct;
      wrong += row.wrong;
      count += 1;

      const attempted = row.correct + row.wrong;
      trend.push({
        date: mock.test_date,
        name: mock.name,
        net: Number((row.correct - 0.5 * row.wrong).toFixed(1)),
        accuracy:
          attempted === 0 ? 0 : Math.round((row.correct / attempted) * 100),
      });
    }

    const attempted = correct + wrong;
    const net = correct - 0.5 * wrong;

    return {
      slug: section.slug,
      label: section.label,
      questions: section.questions,
      mocks: count,
      correct,
      wrong,
      attempted,
      accuracy: attempted === 0 ? 0 : Math.round((correct / attempted) * 100),
      avgNet: count === 0 ? 0 : Number((net / count).toFixed(1)),
      avgAttempted: count === 0 ? 0 : Number((attempted / count).toFixed(1)),
      skipRate:
        count === 0
          ? 0
          : Math.round(
              ((section.questions * count - attempted) /
                (section.questions * count)) *
                100
            ),
      trend,
    };
  });
}

/** SSC CGL Tier 1: 25 questions per section, +2 correct, −0.5 wrong. */
const TIER1_MARKS_PER_CORRECT = 2;
const TIER1_NEGATIVE_PER_WRONG = 0.5;
export const TIER1_SECTION_MARKS = 50;
export const TIER1_TOTAL_MARKS = 200;

export type ScoreSection = {
  slug: string;
  label: string;
  /** Correct out of attempted, as a percentage. */
  accuracy: number;
  /** Share of the 25 questions you'd realistically attempt. */
  attemptRate: number;
  expectedMarks: number;
  /** Marks if you covered the whole section and held your current accuracy. */
  potentialMarks: number;
  gain: number;
  remainingHours: number;
  /** Marks you'd gain per remaining study hour, where accuracy is known. */
  marksPerHour: number | null;
  basis: "mocks" | "practice" | "none";
};

export type ScoreProjection = {
  expected: number;
  target: number;
  gap: number;
  sections: ScoreSection[];
  bestLeverage: ScoreSection | null;
  confidence: "low" | "medium" | "high";
};

/**
 * Turns mock and practice data into an expected Tier 1 score. Mocks are used
 * where available since they reflect exam conditions; otherwise practice
 * accuracy is combined with how much of the section you've actually covered,
 * because you can't attempt what you haven't studied.
 */
export function projectedScore(input: {
  topics: Topic[];
  sessions: McqSession[];
  mocks: MockTest[];
  subjects: Subject[];
  settings: UserSettings | null;
}): ScoreProjection {
  const { topics, sessions, mocks, subjects, settings } = input;
  const sectional = sectionalPerformance(mocks);
  const subjectBySlug = new Map(subjects.map((s) => [s.slug, s]));
  const topicSubject = new Map(topics.map((t) => [t.id, t.subject_id]));

  const sections: ScoreSection[] = MOCK_SECTIONS.map((meta) => {
    const subject = subjectBySlug.get(meta.slug);
    const subjectTopics = subject
      ? topics.filter((t) => t.subject_id === subject.id)
      : [];
    const progress = topicsProgress(subjectTopics);

    // Half credit for in-progress work — you can attempt some of it already
    const coveredMinutes = subjectTopics.reduce((sum, t) => {
      if (t.status === "done") return sum + topicMinutes(t);
      if (t.status === "in_progress") return sum + topicMinutes(t) * 0.5;
      return sum;
    }, 0);
    const coverage =
      progress.totalMinutes === 0 ? 0 : coveredMinutes / progress.totalMinutes;

    const fromMocks = sectional.find((s) => s.slug === meta.slug);

    let accuracy = 0;
    let attemptRate = 0;
    let basis: ScoreSection["basis"] = "none";

    if (fromMocks && fromMocks.mocks > 0) {
      accuracy = fromMocks.accuracy / 100;
      attemptRate = Math.min(1, fromMocks.avgAttempted / meta.questions);
      basis = "mocks";
    } else if (subject) {
      const practice = sessions.filter(
        (s) => topicSubject.get(s.topic_id) === subject.id
      );
      const attempted = practice.reduce((n, s) => n + s.total_questions, 0);
      if (attempted > 0) {
        accuracy =
          practice.reduce((n, s) => n + s.correct_answers, 0) / attempted;
        attemptRate = coverage;
        basis = "practice";
      }
    }

    const marksFor = (attempted: number) => {
      const correct = attempted * accuracy;
      const wrong = attempted - correct;
      return Math.max(
        0,
        correct * TIER1_MARKS_PER_CORRECT - wrong * TIER1_NEGATIVE_PER_WRONG
      );
    };

    const expectedMarks = marksFor(meta.questions * attemptRate);
    // Covering the rest of the section lets you attempt all of it, but your
    // accuracy is the ceiling — so an untouched section isn't worth all 50.
    const potentialMarks = basis === "none" ? 0 : marksFor(meta.questions);
    const gain = Math.max(0, potentialMarks - expectedMarks);
    const remainingHours = progress.remainingMinutes / 60;

    return {
      slug: meta.slug,
      label: meta.label,
      accuracy: Math.round(accuracy * 100),
      attemptRate: Math.round(attemptRate * 100),
      expectedMarks: Number(expectedMarks.toFixed(1)),
      potentialMarks: Number(potentialMarks.toFixed(1)),
      gain: Number(gain.toFixed(1)),
      remainingHours: Number(remainingHours.toFixed(1)),
      marksPerHour:
        basis !== "none" && remainingHours > 0
          ? Number((gain / remainingHours).toFixed(2))
          : null,
      basis,
    };
  });

  const expected = Number(
    sections.reduce((sum, s) => sum + s.expectedMarks, 0).toFixed(1)
  );
  const target = settings?.target_score ?? 150;

  const withLeverage = sections.filter((s) => s.marksPerHour !== null);
  const bestLeverage =
    withLeverage.length > 0
      ? withLeverage.reduce((best, s) =>
          (s.marksPerHour ?? 0) > (best.marksPerHour ?? 0) ? s : best
        )
      : null;

  const questionsAnswered = sessions.reduce(
    (n, s) => n + s.total_questions,
    0
  );
  const mocksWithSections = sectional.filter((s) => s.mocks > 0).length;
  const confidence =
    mocksWithSections >= 3
      ? "high"
      : mocksWithSections >= 1 || questionsAnswered >= 300
        ? "medium"
        : "low";

  return {
    expected,
    target,
    gap: Number((target - expected).toFixed(1)),
    sections,
    bestLeverage,
    confidence,
  };
}

/** Weakest section by net marks, ignoring sections with no data. */
export function weakestSection(stats: SectionalStat[]): SectionalStat | null {
  const withData = stats.filter((s) => s.mocks > 0);
  if (withData.length === 0) return null;
  return withData.reduce((worst, s) => (s.avgNet < worst.avgNet ? s : worst));
}
