import type {
  McqSession as PrismaMcqSession,
  MockTest as PrismaMockTest,
  StudySession as PrismaStudySession,
  Subject as PrismaSubject,
  Topic as PrismaTopic,
  UserSettings as PrismaUserSettings,
} from "@prisma/client";
import type {
  McqSession,
  MockSectionScore,
  MockTest,
  StudySession,
  Subject,
  Topic,
  TopicPriority,
  TopicStatus,
  TopicWithSubject,
  UserSettings,
} from "@/lib/types";

function iso(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null;
}

function dateOnly(d: Date): string {
  // @db.Date values come back as UTC midnight; prefer the UTC calendar day
  // so a stored "2026-08-08" doesn't become "2026-08-07" in IST.
  return d.toISOString().slice(0, 10);
}

export function mapSubject(s: PrismaSubject): Subject {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    display_order: s.displayOrder,
    created_at: s.createdAt.toISOString(),
  };
}

export function mapTopic(
  t: PrismaTopic & { subject?: PrismaSubject }
): Topic | TopicWithSubject {
  const base: Topic = {
    id: t.id,
    user_id: t.userId,
    subject_id: t.subjectId,
    name: t.name,
    section: t.section ?? null,
    display_order: t.displayOrder ?? 0,
    status: t.status as TopicStatus,
    priority: t.priority as TopicPriority,
    confidence: t.confidence,
    notes: t.notes,
    estimated_minutes: t.estimatedMinutes ?? 0,
    last_practiced_at: iso(t.lastPracticedAt),
    last_revised_at: iso(t.lastRevisedAt),
    review_count: t.reviewCount ?? 0,
    status_updated_at: iso(t.statusUpdatedAt),
    created_at: t.createdAt.toISOString(),
  };

  if (t.subject) {
    return { ...base, subjects: mapSubject(t.subject) };
  }
  return base;
}

export function mapSession(
  s: PrismaMcqSession & {
    topic?: PrismaTopic & { subject?: PrismaSubject };
  }
): McqSession {
  return {
    id: s.id,
    user_id: s.userId,
    topic_id: s.topicId,
    session_date: dateOnly(s.sessionDate),
    total_questions: s.totalQuestions,
    correct_answers: s.correctAnswers,
    time_taken_minutes: s.timeTakenMinutes,
    notes: s.notes,
    created_at: s.createdAt.toISOString(),
    topics: s.topic
      ? (mapTopic(s.topic) as Topic & { subjects?: Subject })
      : undefined,
  };
}

export function mapStudySession(
  s: PrismaStudySession & {
    topic?: PrismaTopic & { subject?: PrismaSubject };
  }
): StudySession {
  return {
    id: s.id,
    user_id: s.userId,
    topic_id: s.topicId,
    session_date: dateOnly(s.sessionDate),
    minutes: s.minutes,
    source: s.source,
    created_at: s.createdAt.toISOString(),
    topics: s.topic
      ? (mapTopic(s.topic) as Topic & { subjects?: Subject })
      : undefined,
  };
}

export function mapSettings(s: PrismaUserSettings): UserSettings {
  return {
    id: s.id,
    user_id: s.userId,
    exam_date: s.examDate ? dateOnly(s.examDate) : null,
    weekly_target_topics: s.weeklyTargetTopics,
    weekly_target_mcqs: s.weeklyTargetMcqs,
    target_score: s.targetScore,
    cutoff_category: (s.cutoffCategory as UserSettings["cutoff_category"]) ?? "ur",
    reminder_time: s.reminderTime,
    reminder_offset: s.reminderOffset,
    seen_milestones: s.seenMilestones,
  };
}

export function mapMockTest(m: PrismaMockTest): MockTest {
  return {
    id: m.id,
    user_id: m.userId,
    test_date: dateOnly(m.testDate),
    name: m.name,
    total_questions: m.totalQuestions,
    correct: m.correct,
    wrong: m.wrong,
    score: m.score,
    percentile: m.percentile,
    sectional_breakdown:
      (m.sectionalBreakdown as Record<string, MockSectionScore> | null) ?? null,
    notes: m.notes,
    created_at: m.createdAt.toISOString(),
  };
}
