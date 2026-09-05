import type { Metadata } from "next";
import { examService } from "@/lib/services/examService";
import { ExamPageContent } from "@/components/exams/ExamPageContent";

export const metadata: Metadata = {
  title: "NEET Study Materials | QuizStep",
  description: "Access curated NEET physics, chemistry, and biology question banks.",
};

export default function NeetPage() {
  const exam = examService.getExamBySlug("neet");
  if (!exam) return null;

  return <ExamPageContent exam={exam} />;
}
