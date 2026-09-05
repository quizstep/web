import type { Metadata } from "next";
import { examService } from "@/lib/services/examService";
import { ExamPageContent } from "@/components/exams/ExamPageContent";

export const metadata: Metadata = {
  title: "JEE Study Materials | QuizStep",
  description: "Access curated JEE physics, chemistry, and mathematics question banks.",
};

export default function JeePage() {
  const exam = examService.getExamBySlug("jee");
  if (!exam) return null;

  return <ExamPageContent exam={exam} />;
}
