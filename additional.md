# Follow-up Prompt: Simplify Login + Make Motivation the Core Focus + Add Prep Features

Paste this into your agent as a follow-up. The existing schema, routes, and Notion-style UI are already built — extend them, don't redo them. Keep every new addition consistent with the existing flat, minimal, muted-accent visual style already in place.

---

## 1. Simplify the login system
The current auth flow is too much friction for a tool meant to be opened daily. Fix:
- Use **Supabase magic link (passwordless) auth** — no password to remember, no signup form with multiple fields.
- **Long-lived sessions.** Once logged in, keep the user signed in for weeks (30-60+ days), not the default short session. They should almost never see the login screen again on the same device.
- **No onboarding wizard.** After first login, go straight to the dashboard — don't make the user configure things step-by-step before they can see their data. Sensible defaults everywhere; settings (like exam date) are editable later from a single simple settings page, not a forced setup flow.
- Login screen itself should be a single clean input (email) and one button — nothing else on that page.

## 2. Make motivation the central design principle, not an add-on
Right now the app is a tracker. It needs to feel like something that *pulls you back in* daily. Streaks are the anchor for this — treat them as a first-class element, not a small stat buried in the dashboard.

- **Streak counter is the most prominent element on the dashboard** — current streak and longest streak, both visible without scrolling. A streak counts as "kept" on any day the user logs at least one MCQ session or marks a topic done/in-progress.
- **Keep it understated, not gamified-loud.** Stay within the existing Notion-style palette — no confetti, no cartoon badges, no bright gradients. A small, tasteful animation (e.g. the streak number ticking up, a subtle fill on a flame/dot icon) is enough. Restraint is what makes it feel like a serious tool rather than a game.
- **"Today's focus" panel** at the top of the dashboard — on login, immediately surface what to do today: 1-2 revision-due topics, plus the next not-yet-started topic in priority order. This removes the "what should I even study today" friction, which is itself a big driver of people abandoning trackers.
- **Milestones, shown quietly** — small one-line acknowledgments the first time something happens: first topic completed, 7-day streak, 50 MCQ sessions logged, a subject fully completed. Show as a small toast or a subtle line in an activity log, not a popup modal.
- **Personal bests** — quietly track and surface things like "most MCQs solved in a day" or "best single-session accuracy" somewhere on the analytics page, framed positively.

## 3. New tracking features to add

**Exam countdown + pace projection**
- Add an `exam_date` field to a simple user settings table/row.
- Show days remaining prominently near the streak counter.
- Compute a pace projection: based on topics completed per week so far, estimate a projected syllabus-completion date and compare it against the exam date ("on pace" / "X days behind pace"). This is the single most useful number in the app — surface it clearly, not buried in a chart.

**Revision reminders (lightweight spaced repetition)**
- Any topic marked `done` where `last_practiced_at` is more than 10-14 days ago gets flagged as "needs revision" and surfaces in the "Today's focus" panel and/or a dedicated filter on the Syllabus Tracker page.

**Negative-marking-aware scoring**
- Alongside raw accuracy, compute and display a net score estimate per MCQ session: `correct - 0.5 * wrong` (SSC CGL's actual negative marking scheme). Show this on the topic detail page and in analytics trend charts, not just raw accuracy %.

**Mock test tracker (separate from topic-wise MCQ logs)**
- New table `mock_tests`: date, source/name, total questions, correct, wrong, score, percentile (optional), sectional breakdown (optional, can be a JSON column for Quant/Reasoning/English/GS scores).
- Simple list + trend line chart on the Analytics page, kept visually distinct from per-topic MCQ practice since it's a different kind of signal.

**Daily/weekly targets**
- A simple settable target (e.g. "3 topics or 100 MCQs this week"), shown as a small progress bar near the streak counter. Auto-suggest a reasonable target based on days-to-exam and topics-remaining, but let the user override it.

**Weightage-aware priority tag**
- Add a `priority` flag (or simple high/medium/low field) to topics, so high-exam-weightage-but-low-confidence topics can be manually flagged and surfaced first in "Today's focus" and at the top of the Syllabus Tracker filter.

**Notes/formula sheet**
- A single page that pulls the `notes` field from every topic into one scrollable, searchable reference view — for quick last-week revision.

## Build order
1. Auth simplification first (this affects daily usability immediately)
2. Streak logic + "Today's focus" panel + exam countdown/pace (the motivation core)
3. Revision reminders + priority tags (feed into Today's focus)
4. Mock test tracker + negative-marking scoring
5. Daily/weekly targets
6. Notes/formula sheet page
7. Milestones/personal bests last — polish, not core

Keep every new UI element consistent with the existing minimal, flat, muted-accent design system. Don't introduce new colors, shadows, or card styles that weren't part of the earlier restyle.