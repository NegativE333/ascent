"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SUBJECT_SEED, TOPIC_SEED } from "@/lib/syllabus-seed";
import type { TopicPriority, TopicStatus } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

async function markActivity(userId: string, date = new Date()) {
  const day = new Date(date.toISOString().slice(0, 10));
  await prisma.activityDay.upsert({
    where: { userId_date: { userId, date: day } },
    update: {},
    create: { userId, date: day },
  });
}

export async function ensureSyllabusSeeded() {
  const user = await requireUser();

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const expectedTotal = Object.values(TOPIC_SEED).reduce(
    (n, list) => n + list.length,
    0
  );

  const [subjectCount, topicCount, gaUnsectioned] = await Promise.all([
    prisma.subject.count(),
    prisma.topic.count({ where: { userId: user.id } }),
    prisma.topic.count({
      where: {
        userId: user.id,
        subject: { slug: "general-awareness" },
        OR: [{ section: null }, { section: "" }],
      },
    }),
  ]);

  // Fast path once the detailed GK syllabus is synced
  if (
    subjectCount >= SUBJECT_SEED.length &&
    topicCount >= expectedTotal &&
    gaUnsectioned === 0
  ) {
    return;
  }

  for (const subject of SUBJECT_SEED) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: { name: subject.name, displayOrder: subject.displayOrder },
      create: {
        name: subject.name,
        slug: subject.slug,
        displayOrder: subject.displayOrder,
      },
    });
  }

  const subjects = await prisma.subject.findMany();
  const bySlug = new Map(subjects.map((s) => [s.slug, s.id]));

  for (const [slug, seedTopics] of Object.entries(TOPIC_SEED)) {
    const subjectId = bySlug.get(slug);
    if (!subjectId) continue;

    const existing = await prisma.topic.findMany({
      where: { userId: user.id, subjectId },
      select: {
        id: true,
        name: true,
        section: true,
        displayOrder: true,
        _count: { select: { sessions: true } },
      },
    });
    const byName = new Map(existing.map((t) => [t.name, t]));
    const seedNames = new Set(seedTopics.map((t) => t.name));

    const toCreate = [];
    for (let i = 0; i < seedTopics.length; i++) {
      const t = seedTopics[i];
      const order = i + 1;
      const hit = byName.get(t.name);
      if (!hit) {
        toCreate.push({
          userId: user.id,
          subjectId,
          name: t.name,
          section: t.section ?? null,
          displayOrder: order,
          status: t.status ?? ("not_started" as const),
          confidence: t.confidence ?? 0,
        });
      } else if (
        hit.section !== (t.section ?? null) ||
        hit.displayOrder !== order
      ) {
        await prisma.topic.update({
          where: { id: hit.id },
          data: {
            section: t.section ?? null,
            displayOrder: order,
          },
        });
      }
    }

    if (toCreate.length > 0) {
      await prisma.topic.createMany({ data: toCreate, skipDuplicates: true });
    }

    // Drop obsolete seed leftovers with no practice logged
    for (const old of existing) {
      if (seedNames.has(old.name)) continue;
      if (old._count.sessions > 0) continue;
      await prisma.topic.delete({ where: { id: old.id } });
    }
  }
}

export async function updateTopicStatus(topicId: string, status: TopicStatus) {
  const user = await requireUser();
  await prisma.topic.updateMany({
    where: { id: topicId, userId: user.id },
    data: {
      status,
      statusUpdatedAt: new Date(),
    },
  });
  if (status === "in_progress" || status === "done") {
    await markActivity(user.id);
  }
  revalidatePath("/");
  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${topicId}`);
  revalidatePath("/analytics");
  revalidatePath("/notes");
}

export async function updateTopicConfidence(topicId: string, confidence: number) {
  const user = await requireUser();
  await prisma.topic.updateMany({
    where: { id: topicId, userId: user.id },
    data: { confidence },
  });
  revalidatePath("/");
  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${topicId}`);
}

export async function updateTopicPriority(
  topicId: string,
  priority: TopicPriority
) {
  const user = await requireUser();
  await prisma.topic.updateMany({
    where: { id: topicId, userId: user.id },
    data: { priority },
  });
  revalidatePath("/");
  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${topicId}`);
}

export async function updateTopicNotes(topicId: string, notes: string) {
  const user = await requireUser();
  await prisma.topic.updateMany({
    where: { id: topicId, userId: user.id },
    data: { notes },
  });
  revalidatePath(`/syllabus/${topicId}`);
  revalidatePath("/notes");
}

export async function createMcqSession(input: {
  topicId: string;
  totalQuestions: number;
  correctAnswers: number;
  timeTakenMinutes?: number | null;
  sessionDate?: string;
  notes?: string;
}) {
  const user = await requireUser();

  const topic = await prisma.topic.findFirst({
    where: { id: input.topicId, userId: user.id },
  });
  if (!topic) throw new Error("Topic not found");

  const sessionDate = input.sessionDate
    ? new Date(input.sessionDate)
    : new Date();

  await prisma.mcqSession.create({
    data: {
      userId: user.id,
      topicId: input.topicId,
      totalQuestions: input.totalQuestions,
      correctAnswers: input.correctAnswers,
      timeTakenMinutes: input.timeTakenMinutes ?? null,
      sessionDate,
      notes: input.notes || null,
    },
  });

  await prisma.topic.update({
    where: { id: input.topicId },
    data: {
      lastPracticedAt: new Date(),
      statusUpdatedAt: new Date(),
      ...(topic.status === "not_started"
        ? { status: "in_progress" as const }
        : {}),
    },
  });

  await markActivity(user.id, sessionDate);

  revalidatePath("/");
  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${input.topicId}`);
  revalidatePath("/analytics");
}

export async function updateUserSettings(input: {
  examDate?: string | null;
  weeklyTargetTopics?: number;
  weeklyTargetMcqs?: number;
}) {
  const user = await requireUser();
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {
      ...(input.examDate !== undefined
        ? {
            examDate: input.examDate ? new Date(input.examDate) : null,
          }
        : {}),
      ...(input.weeklyTargetTopics !== undefined
        ? { weeklyTargetTopics: input.weeklyTargetTopics }
        : {}),
      ...(input.weeklyTargetMcqs !== undefined
        ? { weeklyTargetMcqs: input.weeklyTargetMcqs }
        : {}),
    },
    create: {
      userId: user.id,
      examDate: input.examDate ? new Date(input.examDate) : null,
      weeklyTargetTopics: input.weeklyTargetTopics ?? 3,
      weeklyTargetMcqs: input.weeklyTargetMcqs ?? 100,
    },
  });
  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/analytics");
}

export async function markMilestonesSeen(ids: string[]) {
  if (ids.length === 0) return;
  const user = await requireUser();
  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
  const merged = Array.from(new Set([...settings.seenMilestones, ...ids]));
  await prisma.userSettings.update({
    where: { userId: user.id },
    data: { seenMilestones: merged },
  });
}

export async function createMockTest(input: {
  name: string;
  testDate?: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  score?: number | null;
  percentile?: number | null;
  notes?: string;
  sectionalBreakdown?: Record<string, number> | null;
}) {
  const user = await requireUser();
  const testDate = input.testDate ? new Date(input.testDate) : new Date();
  const score =
    input.score ??
    Number((input.correct - 0.5 * input.wrong).toFixed(1));

  await prisma.mockTest.create({
    data: {
      userId: user.id,
      name: input.name,
      testDate,
      totalQuestions: input.totalQuestions,
      correct: input.correct,
      wrong: input.wrong,
      score,
      percentile: input.percentile ?? null,
      notes: input.notes || null,
      sectionalBreakdown: input.sectionalBreakdown ?? undefined,
    },
  });

  await markActivity(user.id, testDate);
  revalidatePath("/analytics");
  revalidatePath("/");
}

export async function deleteMockTest(id: string) {
  const user = await requireUser();
  await prisma.mockTest.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/analytics");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
