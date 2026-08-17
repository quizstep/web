/**
 * Exam domain types for QuizStep
 */

export interface ExamInfo {
  slug: 'jee' | 'neet' | 'keam' | 'cuet';
  name: string;
  fullName: string;
  description: string;
  subjects: string[];
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  questionCount: number;
  isUnlocked?: boolean;
}
