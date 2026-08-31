# Follow-up Prompt: Add Sectional Mock Tracking

Extend the existing tracker with sectional mock tracking. This is distinct from the full-length `mock_tests` table already built — a sectional mock tests **one subject only** (e.g. "Quant Sectional Mock," "Reasoning Sectional Mock"), not the full paper. Keep it separate; don't merge it into the full-mock table.

## Schema

```sql
subjects (
  -- already exists: Quantitative Aptitude, Reasoning, English, General Awareness
)

sectional_mocks (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id),
  mock_name text,              -- e.g. "SSC Adda Sectional Test 4"
  mock_date date not null default current_date,
  total_questions int not null,
  correct_answers int not null,
  wrong_answers int not null,
  time_taken_minutes int,
  notes text,
  created_at timestamptz default now()
)
```

Compute (don't store): accuracy % and net score using SSC's negative marking (`correct - 0.5 * wrong`), same formula already used for MCQ session scoring elsewhere in the app.

## Features

**Log a sectional mock**
- Simple form: pick subject, mock name (optional/freeform), date, questions, correct, wrong, time taken, notes.
- Accessible from the subject page (e.g. a "Log Sectional Mock" action on the Quant subject view) and from a general "Log" entry point, same pattern as the existing MCQ session logger.

**Subject-level view**
- On each subject's page, show a sectional-mock history table (date, score, accuracy, net score) plus a trend line chart — same visual pattern as the topic-level MCQ trend chart already built, just scoped to the subject instead of a single topic.
- This sits above/alongside the topic list for that subject, since it's subject-wide, not topic-specific.

**Cross-subject comparison (Analytics page)**
- Add a section comparing sectional mock performance across all four subjects — e.g. a small multi-line chart or grouped bars showing average net score per subject, so it's easy to see which subject is weakest at the sectional level (as opposed to which *topic* is weakest — sectional performance and topic-wise confidence can disagree, and that gap itself is useful signal).

**Dashboard**
- Add sectional mocks to the existing daily-activity streak logic — logging a sectional mock counts as a "kept streak" day, same as an MCQ session or full mock.

## What NOT to change
- Keep the existing `mock_tests` (full-length) table and its UI exactly as is — this is additive, not a replacement.
- Don't touch topic-level MCQ session tracking, syllabus tracker, or the exam countdown/pace features.
- Match the existing Notion-style visual system already in place (flat, muted accent, thin borders, no new card styles).