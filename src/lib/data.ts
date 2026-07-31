import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureSyllabusSeeded } from "@/lib/actions";
import {
  mapMockTest,
  mapSession,
  mapSettings,
  mapSubject,
  mapTopic,
} from "@/lib/mappers";
import type {
  McqSession,
  MockTest,
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

export const getSubjects = cache(async (): Promise<Subject[]> => {
  const subjects = await prisma.subject.findMany({
    orderBy: { displayOrder: "asc" },
  });
  return subjects.map(mapSubject);
});

export const getTopics = cache(async (): Promise<TopicWithSubject[]> => {
  const userId = await requireUserId();
  await ensureSeeded();
  const topics = await prisma.topic.findMany({
    where: { userId },
    include: { subject: true },
    orderBy: [{ priority: "asc" }, { name: "asc" }],
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
  const [days, sessions] = await Promise.all([
    prisma.activityDay.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true },
    }),
    prisma.mcqSession.findMany({
      where: { userId },
      select: { sessionDate: true },
    }),
  ]);
  const dates = new Set<string>();
  for (const d of days) dates.add(d.date.toISOString().slice(0, 10));
  for (const s of sessions) dates.add(s.sessionDate.toISOString().slice(0, 10));
  return Array.from(dates);
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

  const [subjects, topics, sessions, settings, activityDates, mocks] =
    await Promise.all([
      getSubjects(),
      getTopics(),
      getSessions(),
      getSettings(),
      getActivityDates(),
      getMockTests(),
    ]);

  return { subjects, topics, sessions, settings, activityDates, mocks };
});

export type { Topic, Subject, McqSession, UserSettings, MockTest };
