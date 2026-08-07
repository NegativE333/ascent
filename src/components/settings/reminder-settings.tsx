"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { updateUserSettings } from "@/lib/actions";
import {
  removePushSubscription,
  savePushSubscription,
} from "@/lib/push-actions";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** Fixed to match the once-daily cron, which is all the Hobby plan allows. */
const REMINDER_TIME = "09:00";

export function ReminderSettings({
  vapidPublicKey,
}: {
  vapidPublicKey: string;
}) {
  const [pending, startTransition] = useTransition();
  const [subscribed, setSubscribed] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(Boolean(sub)))
      .catch(() => setSubscribed(false));
  }, []);

  async function enable() {
    if (!vapidPublicKey) {
      toast.error("Push keys are not configured on the server");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Notifications blocked — enable them in browser settings");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const json = sub.toJSON();
    if (!json.keys?.p256dh || !json.keys?.auth) {
      toast.error("Could not read push keys from the browser");
      return;
    }

    startTransition(async () => {
      await savePushSubscription({
        endpoint: sub.endpoint,
        p256dh: json.keys!.p256dh!,
        auth: json.keys!.auth!,
      });
      await updateUserSettings({
        reminderTime: REMINDER_TIME,
        reminderOffset: -new Date().getTimezoneOffset(),
      });
      setSubscribed(true);
      toast.success("Daily reminder on — 9:00 each morning");
    });
  }

  function disable() {
    startTransition(async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      await updateUserSettings({ reminderTime: null });
      setSubscribed(false);
      toast.success("Reminders turned off");
    });
  }

  if (!supported) {
    return (
      <div className="panel px-4 py-3">
        <p className="text-sm font-medium">Daily reminder</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This browser doesn&apos;t support push notifications. On iPhone, add
          Ascent to your home screen first, then reminders become available.
        </p>
      </div>
    );
  }

  return (
    <div className="panel space-y-3 px-4 py-3">
      <div>
        <p className="text-sm font-medium">Daily reminder</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          A nudge at 9:00 each morning, skipped on days you&apos;ve already
          logged something.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {subscribed ? (
          <>
            <span className="text-sm text-success">On · 9:00 daily</span>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={disable}
              disabled={pending}
            >
              <BellOff className="size-3.5" />
              Turn off
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={enable} disabled={pending}>
            <Bell className="size-3.5" />
            {pending ? "Enabling…" : "Enable reminders"}
          </Button>
        )}
      </div>
    </div>
  );
}
