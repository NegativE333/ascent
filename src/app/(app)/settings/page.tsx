import { ReminderSettings } from "@/components/settings/reminder-settings";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettings, getTopics } from "@/lib/data";
import { suggestWeeklyTargets } from "@/lib/stats";

export default async function SettingsPage() {
  const [settings, topics] = await Promise.all([getSettings(), getTopics()]);
  const suggested = suggestWeeklyTargets(topics, settings);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Exam date and weekly targets. Change anytime — no setup wizard.
        </p>
      </div>

      <SettingsForm settings={settings} suggested={suggested} />

      <div className="max-w-md">
        <ReminderSettings
          vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
        />
      </div>
    </div>
  );
}
