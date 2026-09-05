import type { Metadata } from "next";
import { examService } from "@/lib/services/examService";
import { ExamPageContent } from "@/components/exams/ExamPageContent";

export const metadata: Metadata = {
  title: "CUET Study Materials | QuizStep",
  description: "Access curated CUET university entrance test question banks.",
};

export default function CuetPage() {
  const exam = examService.getExamBySlug("cuet");
  if (!exam) return null;

  return <ExamPageContent exam={exam} />;
}
