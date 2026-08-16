/**
 * Database schema TypeScript representations
 * Corresponds to database/schema/*.sql
 */

export interface ProfileTable {
  id: string; // references auth.users(id)
  full_name: string;
  phone: string | null;
  role: 'student' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface EntranceExamTable {
  id: string;
  name: string;
  code: string; // 'jee', 'neet', 'keam', 'cuet'
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SubjectTable {
  id: string;
  exam_id: string;
  name: string;
  code: string; // 'physics', 'chemistry', 'maths', 'biology'
  created_at: string;
}

export interface ChapterTable {
  id: string;
  subject_id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface ChapterResourceTable {
  id: string;
  chapter_id: string;
  title: string;
  type: 'formula_sheet' | 'notes' | 'summary_pdf';
  file_url: string;
  is_free: boolean;
  created_at: string;
}

export interface MCQQuestionTable {
  id: string;
  chapter_id: string;
  question_text: string;
  question_type: 'single_choice' | 'numerical';
  options: Record<string, string> | null;
  correct_option: string | null;
  correct_numerical_value: number | null;
  solution_text: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  is_pyq: boolean;
  pyq_year: number | null;
  created_at: string;
}

export interface QuestionVideoTable {
  id: string;
  question_id: string;
  video_url: string;
  duration_seconds: number | null;
  created_at: string;
}

export interface UserSessionTable {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  created_at: string;
  last_active_at: string;
}

export interface ReportFeedbackTable {
  id: string;
  user_id: string | null;
  question_id: string | null;
  type: 'question_error' | 'app_bug' | 'general_feedback';
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}
