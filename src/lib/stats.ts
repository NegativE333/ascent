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
  Subject,
  Topic,
  TopicWithSubject,
  UserSettings,
} from "@/lib/types";
import { REVISION_DAYS } from "@/lib/types";

export function completionPercent(topics: Topic[]): number {
  if (topics.length === 0) return 0;
  const done = topics.filter((t) => t.status === "done").length;
  return Math.round((done / topics.length) * 100);
}

export function subjectProgress(
  topics: Topic[],
  subjects: Subject[]
): { subject: Subject; percent: number; done: number; total: number }[] {
  return subjects
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((subject) => {
      const subjectTopics = topics.filter((t) => t.subject_id === subject.id);
      const done = subjectTopics.filter((t) => t.status === "done").length;
      const total = subjectTopics.length;
      return {
        subject,
        done,
        total,
        percent: total === 0 ? 0 : Math.round((done / total) * 100),
      };
    });
}

export type SectionProgress = {
  section: string;
  done: number;
  total: number;
  percent: number;
};

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

  return names.map((section) => {
    const rows = bySection.get(section) ?? [];
    const done = rows.filter((t) => t.status === "done").length;
    const total = rows.length;
    return {
      section,
      done,
      total,
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  });
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

export function needsRevision(topic: Topic, days = REVISION_DAYS): boolean {
  if (topic.status !== "done" || !topic.last_practiced_at) return false;
  const last = parseISO(topic.last_practiced_at);
  return differenceInCalendarDays(new Date(), last) >= days;
}

export function revisionTopics(topics: TopicWithSubject[]): TopicWithSubject[] {
  return topics
    .filter((t) => needsRevision(t))
    .sort((a, b) => {
      const aDays = differenceInCalendarDays(
        new Date(),
        parseISO(a.last_practiced_at!)
      );
      const bDays = differenceInCalendarDays(
        new Date(),
        parseISO(b.last_practiced_at!)
      );
      return bDays - aDays;
    });
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

export function examPace(
  topics: Topic[],
  settings: UserSettings | null,
  activityDates: string[]
): {
  daysLeft: number | null;
  projectedDate: string | null;
  status: "no_exam" | "on_pace" | "behind" | "ahead" | "done" | "no_data";
  daysDelta: number | null;
  topicsPerWeek: number;
} {
  const remaining = topics.filter((t) => t.status !== "done").length;
  if (remaining === 0) {
    return {
      daysLeft: settings?.exam_date
        ? differenceInCalendarDays(parseISO(settings.exam_date), new Date())
        : null,
      projectedDate: format(new Date(), "yyyy-MM-dd"),
      status: "done",
      daysDelta: 0,
      topicsPerWeek: 0,
    };
  }

  if (!settings?.exam_date) {
    return {
      daysLeft: null,
      projectedDate: null,
      status: "no_exam",
      daysDelta: null,
      topicsPerWeek: 0,
    };
  }

  const daysLeft = differenceInCalendarDays(
    parseISO(settings.exam_date),
    new Date()
  );
  const done = topics.filter((t) => t.status === "done").length;
  const uniqueDays = new Set(activityDates).size;
  const weeksActive = Math.max(uniqueDays / 7, 1 / 7);
  const topicsPerWeek = done > 0 ? done / weeksActive : 0;

  if (topicsPerWeek <= 0) {
    return {
      daysLeft,
      projectedDate: null,
      status: "no_data",
      daysDelta: null,
      topicsPerWeek: 0,
    };
  }

  const weeksNeeded = remaining / topicsPerWeek;
  const projected = addDays(new Date(), Math.ceil(weeksNeeded * 7));
  const projectedDate = format(projected, "yyyy-MM-dd");
  const daysDelta = differenceInCalendarDays(
    projected,
    parseISO(settings.exam_date)
  );

  let status: "on_pace" | "behind" | "ahead" = "on_pace";
  if (daysDelta > 3) status = "behind";
  else if (daysDelta < -3) status = "ahead";

  return { daysLeft, projectedDate, status, daysDelta, topicsPerWeek };
}

export function weeklyProgress(
  topics: Topic[],
  sessions: McqSession[],
  settings: UserSettings | null
) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const topicsThisWeek = topics.filter((t) => {
    if (!t.status_updated_at) return false;
    if (t.status !== "done" && t.status !== "in_progress") return false;
    return parseISO(t.status_updated_at) >= weekStart;
  }).length;

  const mcqsThisWeek = sessions
    .filter((s) => parseISO(s.session_date) >= weekStart)
    .reduce((sum, s) => sum + s.total_questions, 0);

  const targetTopics = settings?.weekly_target_topics ?? 3;
  const targetMcqs = settings?.weekly_target_mcqs ?? 100;

  return {
    topicsThisWeek,
    mcqsThisWeek,
    targetTopics,
    targetMcqs,
    topicsPct: Math.min(100, Math.round((topicsThisWeek / targetTopics) * 100)),
    mcqsPct: Math.min(100, Math.round((mcqsThisWeek / targetMcqs) * 100)),
  };
}

export function suggestWeeklyTargets(
  topicList: Topic[],
  settings: UserSettings | null
): { topics: number; mcqs: number } {
  const remaining = topicList.filter((t) => t.status !== "done").length;
  if (!settings?.exam_date) {
    return { topics: 3, mcqs: 100 };
  }
  const daysLeft = Math.max(
    1,
    differenceInCalendarDays(parseISO(settings.exam_date), new Date())
  );
  const weeksLeft = Math.max(1, daysLeft / 7);
  const topicTarget = Math.max(2, Math.ceil(remaining / weeksLeft));
  return {
    topics: Math.min(topicTarget, 12),
    mcqs: Math.min(topicTarget * 40, 250),
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
  topics: Topic[]
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
