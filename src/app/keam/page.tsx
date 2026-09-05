import type { Metadata } from "next";
import { examService } from "@/lib/services/examService";
import { ExamPageContent } from "@/components/exams/ExamPageContent";

export const metadata: Metadata = {
  title: "KEAM Study Materials | QuizStep",
  description: "Access curated KEAM engineering, architecture, and medical question banks.",
};

export default function KeamPage() {
  const exam = examService.getExamBySlug("keam");
  if (!exam) return null;

  return <ExamPageContent exam={exam} />;
}
