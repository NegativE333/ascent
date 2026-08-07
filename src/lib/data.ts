import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureSyllabusSeeded } from "@/lib/actions";
import {
  mapMockTest,
  mapSession,
  mapSettings,
  mapStudySession,
  mapSubject,
  mapTopic,
} from "@/lib/mappers";
import type {
  McqSession,
  MockTest,
  StudySession,
  Subject,
  Topic,
  TopicWithSubject,
  UserSettings,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

const requireUserId = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
});

/** Runs at most once per request — avoids parallel seed storms that exhaust the pool. */
const ensureSeeded = cache(async () => {
  await ensureSyllabusSeeded();
});

// Subjects are global seed data, so a short process-level cache is safe and
// saves a cross-region round trip on every render.
const SUBJECTS_TTL_MS = 5 * 60 * 1000;
let subjectsCache: { at: number; value: Subject[] } | null = null;

export const getSubjects = cache(async (): Promise<Subject[]> => {
  if (subjectsCache && Date.now() - subjectsCache.at < SUBJECTS_TTL_MS) {
    return subjectsCache.value;
  }
  const subjects = await prisma.subject.findMany({
    orderBy: { displayOrder: "asc" },
  });
  const value = subjects.map(mapSubject);
  subjectsCache = { at: Date.now(), value };
  return value;
});

export const getTopics = cache(async (): Promise<TopicWithSubject[]> => {
  const userId = await requireUserId();
  await ensureSeeded();
  const topics = await prisma.topic.findMany({
    where: { userId },
    include: { subject: true },
    orderBy: [
      { displayOrder: "asc" },
      { section: "asc" },
      { priority: "asc" },
      { name: "asc" },
    ],
  });
  return topics.map((t) => mapTopic(t) as TopicWithSubject);
});

export const getTopic = cache(
  async (topicId: string): Promise<TopicWithSubject | null> => {
    const userId = await requireUserId();
    await ensureSeeded();
    const topic = await prisma.topic.findFirst({
      where: { id: topicId, userId },
      include: { subject: true },
    });
    return topic ? (mapTopic(topic) as TopicWithSubject) : null;
  }
);

export const getSessions = cache(async (limit?: number): Promise<McqSession[]> => {
  const userId = await requireUserId();
  const sessions = await prisma.mcqSession.findMany({
    where: { userId },
    include: { topic: { include: { subject: true } } },
    orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
    ...(limit ? { take: limit } : {}),
  });
  return sessions.map(mapSession);
});

export const getTopicSessions = cache(
  async (topicId: string): Promise<McqSession[]> => {
    const userId = await requireUserId();
    const sessions = await prisma.mcqSession.findMany({
      where: { topicId, userId },
      orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    });
    return sessions.map(mapSession);
  }
);

export const getSettings = cache(async (): Promise<UserSettings> => {
  const userId = await requireUserId();
  await ensureSeeded();
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return mapSettings(settings);
});

export const getActivityDates = cache(async (): Promise<string[]> => {
  const userId = await requireUserId();
  const [days, sessions, study] = await Promise.all([
    prisma.activityDay.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true },
    }),
    prisma.mcqSession.findMany({
      where: { userId },
      select: { sessionDate: true },
    }),
    prisma.studySession.findMany({
      where: { userId },
      select: { sessionDate: true },
    }),
  ]);
  const dates = new Set<string>();
  for (const d of days) dates.add(d.date.toISOString().slice(0, 10));
  for (const s of sessions) dates.add(s.sessionDate.toISOString().slice(0, 10));
  for (const s of study) dates.add(s.sessionDate.toISOString().slice(0, 10));
  return Array.from(dates);
});

export const getStudySessions = cache(async (): Promise<StudySession[]> => {
  const userId = await requireUserId();
  const sessions = await prisma.studySession.findMany({
    where: { userId },
    orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
  });
  return sessions.map(mapStudySession);
});

export const getMockTests = cache(async (): Promise<MockTest[]> => {
  const userId = await requireUserId();
  const mocks = await prisma.mockTest.findMany({
    where: { userId },
    orderBy: [{ testDate: "desc" }, { createdAt: "desc" }],
  });
  return mocks.map(mapMockTest);
});

export const getNotesTopics = cache(async (): Promise<TopicWithSubject[]> => {
  const topics = await getTopics();
  return topics.filter((t) => t.notes && t.notes.trim().length > 0);
});

export const getDashboardData = cache(async () => {
  // Auth + seed once, then fan out queries (deduped via cache if sidebar already started).
  await requireUserId();
  await ensureSeeded();

  const [subjects, topics, sessions, settings, activityDates, mocks, study] =
    await Promise.all([
      getSubjects(),
      getTopics(),
      getSessions(),
      getSettings(),
      getActivityDates(),
      getMockTests(),
      getStudySessions(),
    ]);

  return {
    subjects,
    topics,
    sessions,
    settings,
    activityDates,
    mocks,
    study,
  };
});

export type {
  Topic,
  Subject,
  McqSession,
  StudySession,
  UserSettings,
  MockTest,
};
