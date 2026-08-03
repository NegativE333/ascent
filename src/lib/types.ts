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
  last_practiced_at: string | null;
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

export type TopicWithSubject = Topic & {
  subjects: Subject;
};

export type UserSettings = {
  id: string;
  user_id: string;
  exam_date: string | null;
  weekly_target_topics: number;
  weekly_target_mcqs: number;
  seen_milestones: string[];
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
  sectional_breakdown: Record<string, number> | null;
  notes: string | null;
  created_at: string;
};

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

export const REVISION_DAYS = 12;
