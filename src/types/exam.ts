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

export interface ChapterTopic {
  id: string;
  name: string;
  category?: string; // e.g. "Botany", "Zoology", "Class 11", "Class 12"
}

export interface TopicNote {
  title: string;
  content: string;
  downloadUrl?: string;
  keyPoints?: string[];
}

export interface TopicShortNote {
  title: string;
  summary: string;
  keyPoints: string[];
  formulaeOrKeywords?: string[];
}

export interface TopicDoubt {
  id: string;
  question: string;
  answer?: string;
  createdAt: string;
  status: 'answered' | 'pending';
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  questionCount: number;
  isUnlocked?: boolean;
}

