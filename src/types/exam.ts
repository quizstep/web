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
  category?: string;
  examSlug?: string;
  examSlugs?: string[];
  hasNotes?: boolean;
  hasShortNotes?: boolean;
  hasDoubts?: boolean;
}

export interface PdfMaterial {
  id: string;
  title: string;
  examSlug: string;
  examSlugs?: string[];
  subject: string;
  category?: string;
  chapterId: string;
  chapterName: string;
  type: 'notes' | 'question_bank';
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
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

