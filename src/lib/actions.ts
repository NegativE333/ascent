"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  SUBJECT_SEED,
  TOPIC_RENAMES_BY_SLUG,
  TOPIC_SEED,
  seedEstimateMinutes,
} from "@/lib/syllabus-seed";
import type {
  MockSectionScore,
  TopicPriority,
  TopicStatus,
} from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

/** Store a YYYY-MM-DD calendar day as a Date that survives UTC mapping. */
function dateOnly(value: string | Date = new Date()) {
  const key =
    typeof value === "string"
      ? value.slice(0, 10)
      : [
          value.getFullYear(),
          String(value.getMonth() + 1).padStart(2, "0"),
          String(value.getDate()).padStart(2, "0"),
        ].join("-");
  return new Date(`${key}T12:00:00.000Z`);
}

function activityUpsert(userId: string, date: string | Date = new Date()) {
  const day = dateOnly(date);
  return prisma.activityDay.upsert({
    where: { userId_date: { userId, date: day } },
    update: {},
    create: { userId, date: day },
  });
}

/**
 * Seed verification costs a few round trips. Bump the version whenever the
 * seed file changes so in-process caches re-sync instead of skipping.
 */
const SYLLABUS_SEED_VERSION = 3;
const verifiedSyllabusUsers = new Map<string, number>();

export async function ensureSyllabusSeeded() {
  const user = await requireUser();
  if (verifiedSyllabusUsers.get(user.id) === SYLLABUS_SEED_VERSION) return;

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const expectedTotal = Object.values(TOPIC_SEED).reduce(
    (n, list) => n + list.length,
    0
  );

  const expectedQuant = TOPIC_SEED["quantitative-aptitude"]?.length ?? 0;
  const expectedReasoning =
    TOPIC_SEED["general-intelligence-reasoning"]?.length ?? 0;

  const [
    subjectCount,
    topicCount,
    gaUnsectioned,
    missingEstimates,
    quantCount,
    reasoningCount,
  ] = await Promise.all([
    prisma.subject.count(),
    prisma.topic.count({ where: { userId: user.id } }),
    prisma.topic.count({
      where: {
        userId: user.id,
        subject: { slug: "general-awareness" },
        OR: [{ section: null }, { section: "" }],
      },
    }),
    prisma.topic.count({
      where: { userId: user.id, estimatedMinutes: 0 },
    }),
    prisma.topic.count({
      where: {
        userId: user.id,
        subject: { slug: "quantitative-aptitude" },
      },
    }),
    prisma.topic.count({
      where: {
        userId: user.id,
        subject: { slug: "general-intelligence-reasoning" },
      },
    }),
  ]);

  // Fast path once Quant + Reasoning + GK syllabi are synced
  if (
    subjectCount >= SUBJECT_SEED.length &&
    topicCount >= expectedTotal &&
    quantCount >= expectedQuant &&
    reasoningCount >= expectedReasoning &&
    gaUnsectioned === 0 &&
    missingEstimates === 0
  ) {
    verifiedSyllabusUsers.set(user.id, SYLLABUS_SEED_VERSION);
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
        estimatedMinutes: true,
        _count: { select: { sessions: true } },
      },
    });

    // Rename topics in place so practice history follows the new names
    const renames = TOPIC_RENAMES_BY_SLUG[slug];
    if (renames) {
      for (const [from, to] of Object.entries(renames)) {
        const old = existing.find((t) => t.name === from);
        const taken = existing.some((t) => t.name === to);
        if (!old || taken) continue;
        await prisma.topic.update({
          where: { id: old.id },
          data: { name: to },
        });
        old.name = to;
      }
    }

    const byName = new Map(existing.map((t) => [t.name, t]));
    const seedNames = new Set(seedTopics.map((t) => t.name));
    // Refresh seeded estimates for Quant/Reasoning when the plan changes
    const syncEstimates =
      slug === "quantitative-aptitude" ||
      slug === "general-intelligence-reasoning";

    const toCreate = [];
    for (let i = 0; i < seedTopics.length; i++) {
      const t = seedTopics[i];
      const order = i + 1;
      const hit = byName.get(t.name);
      const estimatedMinutes = seedEstimateMinutes(slug, t);

      if (!hit) {
        toCreate.push({
          userId: user.id,
          subjectId,
          name: t.name,
          section: t.section ?? null,
          displayOrder: order,
          estimatedMinutes,
          status: t.status ?? ("not_started" as const),
          confidence: t.confidence ?? 0,
        });
      } else if (
        hit.section !== (t.section ?? null) ||
        hit.displayOrder !== order ||
        hit.estimatedMinutes === 0 ||
        (syncEstimates && hit.estimatedMinutes !== estimatedMinutes)
      ) {
        await prisma.topic.update({
          where: { id: hit.id },
          data: {
            section: t.section ?? null,
            displayOrder: order,
            // Quant estimates come from the plan CSV and should refresh;
            // elsewhere only backfill zeros so user edits stick.
            ...(hit.estimatedMinutes === 0 || syncEstimates
              ? { estimatedMinutes }
              : {}),
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

  verifiedSyllabusUsers.set(user.id, SYLLABUS_SEED_VERSION);
}

export async function updateTopicStatus(topicId: string, status: TopicStatus) {
  const user = await requireUser();
  const update = prisma.topic.updateMany({
    where: { id: topicId, userId: user.id },
    data: {
      status,
      statusUpdatedAt: new Date(),
    },
  });

  // One round trip instead of two
  if (status === "in_progress" || status === "done") {
    await prisma.$transaction([update, activityUpsert(user.id)]);
  } else {
    await update;
  }

  revalidatePath("/");
  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${topicId}`);
}

export async function updateTopicConfidence(topicId: string, confidence: number) {
  const user = await requireUser();
  await prisma.topic.updateMany({
    where: { id: topicId, userId: user.id },
    data: { confidence },
  });
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
  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${topicId}`);
}

/**
 * Log a revision. "good" advances the spaced-repetition stage so the topic
 * returns later; "hard" drops it back to the start of the ladder.
 */
export async function markTopicRevised(
  topicId: string,
  recall: "good" | "hard" = "good"
) {
  const user = await requireUser();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, userId: user.id },
    select: { reviewCount: true },
  });
  if (!topic) throw new Error("Topic not found");

  await prisma.$transaction([
    prisma.topic.updateMany({
      where: { id: topicId, userId: user.id },
      data: {
        lastRevisedAt: new Date(),
        reviewCount: recall === "good" ? topic.reviewCount + 1 : 0,
      },
    }),
    activityUpsert(user.id),
  ]);

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

/** Overrides the seeded study-time estimate for pace and progress weighting. */
export async function updateTopicEstimate(topicId: string, minutes: number) {
  const user = await requireUser();
  const estimatedMinutes = Math.max(5, Math.min(24 * 60, Math.round(minutes)));
  await prisma.topic.updateMany({
    where: { id: topicId, userId: user.id },
    data: { estimatedMinutes },
  });
  revalidatePath("/");
  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${topicId}`);
  revalidatePath("/analytics");
  revalidatePath("/settings");
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

  await prisma.$transaction([
    prisma.mcqSession.create({
      data: {
        userId: user.id,
        topicId: input.topicId,
        totalQuestions: input.totalQuestions,
        correctAnswers: input.correctAnswers,
        timeTakenMinutes: input.timeTakenMinutes ?? null,
        sessionDate,
        notes: input.notes || null,
      },
    }),
    prisma.topic.update({
      where: { id: input.topicId },
      data: {
        lastPracticedAt: new Date(),
        statusUpdatedAt: new Date(),
        ...(topic.status === "not_started"
          ? { status: "in_progress" as const }
          : {}),
      },
    }),
    activityUpsert(user.id, sessionDate),
  ]);

  revalidatePath("/");
  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${input.topicId}`);
  revalidatePath("/analytics");
}

/** Records focused study time, with or without questions attempted. */
export async function logStudySession(input: {
  topicId: string;
  minutes: number;
  source?: string;
  /** Browser-local YYYY-MM-DD so IST nights don't land on UTC yesterday. */
  sessionDate?: string;
}) {
  const user = await requireUser();
  const minutes = Math.round(input.minutes);
  if (minutes < 1) return { ok: false as const, error: "Nothing to log" };

  const topic = await prisma.topic.findFirst({
    where: { id: input.topicId, userId: user.id },
    select: { status: true },
  });
  if (!topic) throw new Error("Topic not found");

  const now = new Date();
  const sessionDate = dateOnly(input.sessionDate ?? now);

  await prisma.$transaction([
    prisma.studySession.create({
      data: {
        userId: user.id,
        topicId: input.topicId,
        sessionDate,
        minutes,
        source: input.source ?? "timer",
      },
    }),
    prisma.topic.update({
      where: { id: input.topicId },
      data: {
        lastPracticedAt: now,
        statusUpdatedAt: now,
        ...(topic.status === "not_started"
          ? { status: "in_progress" as const }
          : {}),
      },
    }),
    activityUpsert(user.id, sessionDate),
  ]);

  revalidatePath("/");
  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${input.topicId}`);
  revalidatePath("/analytics");
  revalidatePath("/review");

  return { ok: true as const, minutes };
}

export async function updateUserSettings(input: {
  examDate?: string | null;
  weeklyTargetTopics?: number;
  weeklyTargetMcqs?: number;
  targetScore?: number;
  cutoffCategory?: string;
  reminderTime?: string | null;
  reminderOffset?: number;
}) {
  const user = await requireUser();
  const shared = {
    ...(input.examDate !== undefined
      ? { examDate: input.examDate ? new Date(input.examDate) : null }
      : {}),
    ...(input.weeklyTargetTopics !== undefined
      ? { weeklyTargetTopics: input.weeklyTargetTopics }
      : {}),
    ...(input.weeklyTargetMcqs !== undefined
      ? { weeklyTargetMcqs: input.weeklyTargetMcqs }
      : {}),
    ...(input.targetScore !== undefined
      ? { targetScore: input.targetScore }
      : {}),
    ...(input.cutoffCategory !== undefined
      ? { cutoffCategory: input.cutoffCategory }
      : {}),
    ...(input.reminderTime !== undefined
      ? { reminderTime: input.reminderTime }
      : {}),
    ...(input.reminderOffset !== undefined
      ? { reminderOffset: input.reminderOffset }
      : {}),
  };

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: shared,
    create: { userId: user.id, ...shared },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/analytics");
  revalidatePath("/review");
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
  sectionalBreakdown?: Record<string, MockSectionScore> | null;
}) {
  const user = await requireUser();
  const testDate = input.testDate ? new Date(input.testDate) : new Date();
  const score =
    input.score ??
    Number((input.correct - 0.5 * input.wrong).toFixed(1));

  await prisma.$transaction([
    prisma.mockTest.create({
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
    }),
    activityUpsert(user.id, testDate),
  ]);

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
