"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "ascent.install-dismissed";

export function InstallPrompt() {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (window.localStorage.getItem(DISMISSED_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!event) return null;

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setEvent(null);
  }

  async function install() {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(null);
  }

  return (
    <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2 text-sm">
      <Download className="size-3.5 shrink-0 text-muted-foreground" />
      <p className="min-w-0 flex-1 truncate text-muted-foreground">
        Install Ascent for one-tap access and daily reminders.
      </p>
      <button
        onClick={install}
        className="shrink-0 rounded-[4px] bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
      >
        Install
      </button>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
