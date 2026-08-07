import { NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * The cron runs once a day at 03:30 UTC (09:00 IST), and Vercel's Hobby plan
 * only guarantees the trigger lands somewhere within that hour. The window is
 * wide enough to absorb that drift; a single daily run can't double-send.
 */
const WINDOW_MINUTES = 120;

function configured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );
}

function minutesSinceMidnight(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!configured()) {
    return NextResponse.json(
      { error: "VAPID keys are not configured" },
      { status: 503 }
    );
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const candidates = await prisma.userSettings.findMany({
    where: { reminderTime: { not: null } },
    select: { userId: true, reminderTime: true, reminderOffset: true },
  });

  const nowUtcMinutes =
    new Date().getUTCHours() * 60 + new Date().getUTCMinutes();

  const due = candidates.filter((s) => {
    const local = (nowUtcMinutes + s.reminderOffset + 1440) % 1440;
    const target = minutesSinceMidnight(s.reminderTime!);
    const forward = (local - target + 1440) % 1440;
    return Math.min(forward, 1440 - forward) <= WINDOW_MINUTES;
  });

  if (due.length === 0) {
    return NextResponse.json({ checked: candidates.length, sent: 0 });
  }

  const userIds = due.map((s) => s.userId);
  const offsetByUser = new Map(due.map((s) => [s.userId, s.reminderOffset]));

  // Skip anyone who already studied on their own local day
  const activeToday = new Set<string>();
  const recent = await prisma.activityDay.findMany({
    where: {
      userId: { in: userIds },
      date: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    },
    select: { userId: true, date: true },
  });

  for (const row of recent) {
    const offset = offsetByUser.get(row.userId) ?? 0;
    const localToday = new Date(Date.now() + offset * 60_000)
      .toISOString()
      .slice(0, 10);
    if (row.date.toISOString().slice(0, 10) === localToday) {
      activeToday.add(row.userId);
    }
  }

  const targets = userIds.filter((id) => !activeToday.has(id));
  if (targets.length === 0) {
    return NextResponse.json({ checked: candidates.length, sent: 0 });
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: { in: targets } },
  });

  const payload = JSON.stringify({
    title: "Ascent",
    body: "Today's plan is ready. One topic keeps the streak going.",
    url: "/",
    tag: "daily-reminder",
  });

  let sent = 0;
  const expired: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) expired.push(sub.endpoint);
      }
    })
  );

  if (expired.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expired } },
    });
  }

  return NextResponse.json({
    checked: candidates.length,
    due: due.length,
    sent,
    pruned: expired.length,
  });
}
