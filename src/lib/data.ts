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
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

export async function getSubjects(): Promise<Subject[]> {
  const subjects = await prisma.subject.findMany({
    orderBy: { displayOrder: "asc" },
  });
  return subjects.map(mapSubject);
}

export async function getTopics(): Promise<TopicWithSubject[]> {
  const userId = await requireUserId();
  await ensureSyllabusSeeded();
  const topics = await prisma.topic.findMany({
    where: { userId },
    include: { subject: true },
    orderBy: [{ priority: "asc" }, { name: "asc" }],
  });
  return topics.map((t) => mapTopic(t) as TopicWithSubject);
}

export async function getTopic(topicId: string): Promise<TopicWithSubject | null> {
  const userId = await requireUserId();
  await ensureSyllabusSeeded();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, userId },
    include: { subject: true },
  });
  return topic ? (mapTopic(topic) as TopicWithSubject) : null;
}

export async function getSessions(limit?: number): Promise<McqSession[]> {
  const userId = await requireUserId();
  const sessions = await prisma.mcqSession.findMany({
    where: { userId },
    include: { topic: { include: { subject: true } } },
    orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
    ...(limit ? { take: limit } : {}),
  });
  return sessions.map(mapSession);
}

export async function getTopicSessions(topicId: string): Promise<McqSession[]> {
  const userId = await requireUserId();
  const sessions = await prisma.mcqSession.findMany({
    where: { topicId, userId },
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
  });
  return sessions.map(mapSession);
}

export async function getSettings(): Promise<UserSettings> {
  const userId = await requireUserId();
  await ensureSyllabusSeeded();
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return mapSettings(settings);
}

export async function getActivityDates(): Promise<string[]> {
  const userId = await requireUserId();
  const days = await prisma.activityDay.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
  // Also include legacy session dates for users before ActivityDay existed
  const sessions = await prisma.mcqSession.findMany({
    where: { userId },
    select: { sessionDate: true },
  });
  const dates = new Set<string>();
  for (const d of days) dates.add(d.date.toISOString().slice(0, 10));
  for (const s of sessions) dates.add(s.sessionDate.toISOString().slice(0, 10));
  return Array.from(dates);
}

export async function getMockTests(): Promise<MockTest[]> {
  const userId = await requireUserId();
  const mocks = await prisma.mockTest.findMany({
    where: { userId },
    orderBy: [{ testDate: "desc" }, { createdAt: "desc" }],
  });
  return mocks.map(mapMockTest);
}

export async function getNotesTopics(): Promise<TopicWithSubject[]> {
  const topics = await getTopics();
  return topics.filter((t) => t.notes && t.notes.trim().length > 0);
}

export async function getDashboardData() {
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
}

export type { Topic, Subject, McqSession, UserSettings, MockTest };
