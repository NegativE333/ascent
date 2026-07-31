# Build Prompt: SSC CGL Progress Tracker

Paste everything below into your coding agent as the initial instruction.

---

## Who you are
You are an expert full-stack engineer building a personal, single-user web app for me — an SSC CGL exam aspirant — to track my syllabus preparation and MCQ practice. This app is for daily use over several months, so it needs to be fast, satisfying to update, and visually excellent. Treat this as a portfolio-quality product, not a CRUD prototype.

## Tech stack (non-negotiable)
- **Next.js 14+ (App Router, TypeScript)**
- **Supabase** — Postgres database + Auth (email/password or magic link, single user is fine, but design the schema so it isn't hard-coded to one user)
- **Tailwind CSS** + **shadcn/ui** for components
- **framer-motion** for micro-interactions (checkbox completion, progress bar fills, page transitions)
- **recharts** for charts
- **lucide-react** for icons
- Deployable on Vercel with Supabase env vars

## Core concept
The app has three tightly-linked layers:
1. **Syllabus** — subjects → topics (SSC CGL structure below)
2. **Status tracking** — per topic: not started / in progress / done, plus a self-rated confidence level (this matters more than binary done/not-done, since "done" and "confident" are different things)
3. **MCQ practice logs** — per topic, log practice sessions (questions attempted, correct, time taken). This is what actually proves mastery, not just marking a checkbox.

## Data model (Supabase tables)

```sql
subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,           -- e.g. "Quantitative Aptitude"
  slug text not null unique,
  display_order int
)

topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id),
  name text not null,           -- e.g. "Percentage"
  status text default 'not_started', -- not_started | in_progress | done
  confidence int default 0,     -- 0-5 self-rating
  notes text,
  last_practiced_at timestamptz,
  created_at timestamptz default now()
)

mcq_sessions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id),
  session_date date not null default current_date,
  total_questions int not null,
  correct_answers int not null,
  time_taken_minutes int,
  notes text,
  created_at timestamptz default now()
)
```

Add Row Level Security policies scoped to `auth.uid()` even though it's single-user for now — makes it safe to extend later.

## SSC CGL syllabus structure (seed this on first run)

Use this to seed the `subjects` and `topics` tables:

**Quantitative Aptitude** — Percentage, Profit and Loss, Simple Interest, Compound Interest, Ratio and Proportion, Average, Number System, HCF and LCM, Algebra, Geometry, Mensuration, Trigonometry, Time Speed and Distance, Time and Work, Data Interpretation, Mixture and Alligation

**General Intelligence & Reasoning** — Analogy, Classification, Series (Number/Alphabet), Coding-Decoding, Blood Relations, Direction Sense, Ranking and Order, Syllogism, Venn Diagrams, Non-Verbal Reasoning, Puzzle, Matrix, Word Formation, Statement and Conclusion

**English Comprehension** — Reading Comprehension, Cloze Test, Error Spotting, Sentence Improvement, Fill in the Blanks, Synonyms/Antonyms, Idioms and Phrases, One Word Substitution, Spelling Correction, Para Jumbles, Active-Passive Voice, Direct-Indirect Speech

**General Awareness** — History, Geography, Indian Polity, Economics, Static GK, Science, Current Affairs, Books and Authors, Awards and Honours, Important Days

For seed data on the Quantitative Aptitude topics, mark these as `in_progress` with `confidence: 2` (already covered, not yet confident) since MCQs have been attempted but confidence is still low: **Percentage, Profit and Loss, Compound Interest, Simple Interest, Ratio and Proportion**. Leave everything else `not_started`.

## Pages & features

1. **Dashboard** (`/`)
   - Overall completion % (hero stat, animated radial/circular progress)
   - Subject-wise progress bars, color-coded
   - A GitHub-style contribution heatmap of daily practice activity (based on `mcq_sessions.session_date`)
   - "Weak topics" widget — topics with confidence ≤ 2 AND at least one MCQ session logged (i.e., practiced but still shaky — these need attention)
   - Recent MCQ sessions feed

2. **Syllabus Tracker** (`/syllabus`)
   - Subjects as collapsible accordions/cards
   - Each topic row: name, status toggle (not started/in progress/done as a segmented control, not a dropdown), confidence stars/dots, quick "log MCQs" button, last practiced date
   - Smooth animation when status changes
   - Filter/search bar (by status, subject, confidence)

3. **Topic Detail** (`/syllabus/[topicId]`)
   - Full MCQ session history for that topic as a table + accuracy trend line chart
   - Notes field (freeform, for formulas/tricks you want to remember)
   - Quick-add MCQ session form (questions, correct, time)

4. **Analytics** (`/analytics`)
   - Accuracy trend across all subjects over time
   - Time invested per subject (from `time_taken_minutes`)
   - Streak counter (consecutive days with ≥1 MCQ session)

## Design direction
This needs to feel motivating, not like a spreadsheet. Think: clean dark-mode-first UI, generous whitespace, a confident accent color (not default blue — pick something distinctive), subtle glassmorphism or soft shadows on cards, smooth transitions on every state change. Progress should feel *rewarding* to update — a topic flipping to "done" should have a small satisfying animation, not just a color swap. Use a monospace or distinctive display font for numbers/stats to make the dashboard stats pop.

## Build order
1. Supabase schema + seed script
2. Auth (simple)
3. Syllabus tracker page (core CRUD)
4. Topic detail + MCQ logging
5. Dashboard with charts
6. Analytics page
7. Polish: animations, empty states, mobile responsiveness

Ask me clarifying questions only if something above is genuinely ambiguous — otherwise make reasonable choices and build.