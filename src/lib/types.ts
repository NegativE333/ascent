export type TopicStatus = "not_started" | "in_progress" | "done";
export type TopicPriority = "high" | "medium" | "low";

export type Subject = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
};

export type Topic = {
  id: string;
  user_id: string;
  subject_id: string;
  name: string;
  section: string | null;
  display_order: number;
  status: TopicStatus;
  priority: TopicPriority;
  confidence: number;
  notes: string | null;
  /** Research-based first-pass study time. 0 means not yet estimated. */
  estimated_minutes: number;
  last_practiced_at: string | null;
  last_revised_at: string | null;
  review_count: number;
  status_updated_at: string | null;
  created_at: string;
  subjects?: Subject;
};

export type McqSession = {
  id: string;
  user_id: string;
  topic_id: string;
  session_date: string;
  total_questions: number;
  correct_answers: number;
  time_taken_minutes: number | null;
  notes: string | null;
  created_at: string;
  topics?: Topic & { subjects?: Subject };
};

export type StudySession = {
  id: string;
  user_id: string;
  topic_id: string;
  session_date: string;
  minutes: number;
  source: string;
  created_at: string;
  topics?: Topic & { subjects?: Subject };
};

export type TopicWithSubject = Topic & {
  subjects: Subject;
};

export type UserSettings = {
  id: string;
  user_id: string;
  exam_date: string | null;
  weekly_target_topics: number;
  weekly_target_mcqs: number;
  target_score: number;
  reminder_time: string | null;
  reminder_offset: number;
  seen_milestones: string[];
};

export type MockSectionScore = {
  correct: number;
  wrong: number;
};

export type MockTest = {
  id: string;
  user_id: string;
  test_date: string;
  name: string;
  total_questions: number;
  correct: number;
  wrong: number;
  score: number | null;
  percentile: number | null;
  sectional_breakdown: Record<string, MockSectionScore> | null;
  notes: string | null;
  created_at: string;
};

/** SSC CGL Tier 1 sections, keyed by subject slug so colours stay consistent. */
export const MOCK_SECTIONS = [
  { slug: "quantitative-aptitude", label: "Quant", questions: 25 },
  {
    slug: "general-intelligence-reasoning",
    label: "Reasoning",
    questions: 25,
  },
  { slug: "english-comprehension", label: "English", questions: 25 },
  { slug: "general-awareness", label: "General Awareness", questions: 25 },
] as const;

export const SUBJECT_COLORS: Record<string, string> = {
  "quantitative-aptitude": "#d9730d",
  "general-intelligence-reasoning": "#0f7b6c",
  "english-comprehension": "#9065b0",
  "general-awareness": "#337ea9",
};

export const STATUS_LABELS: Record<TopicStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<TopicPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** Spaced-repetition ladder in days. Each successful review moves up a rung. */
export const REVIEW_INTERVALS = [1, 3, 7, 21, 45] as const;

/**
 * Confidence stretches or shrinks the interval — shaky topics come back sooner,
 * solid ones wait longer.
 */
export const CONFIDENCE_INTERVAL_FACTOR: Record<number, number> = {
  0: 0.5,
  1: 0.5,
  2: 0.75,
  3: 1,
  4: 1.5,
  5: 2,
};
