import type { Metadata } from "next";
import { examService } from "@/lib/services/examService";
import { SubjectSelector } from "@/components/exams/SubjectSelector";
import { MaterialItem } from "@/components/exams/MaterialItem";

export const metadata: Metadata = {
  title: "KEAM Study Materials | QuizStep",
  description: "Access curated KEAM engineering, architecture, and medical question banks.",
};

export default function KeamPage() {
  const exam = examService.getExamBySlug("keam");
  const materials = examService.getMaterials("keam");

  if (!exam) return null;

  return (
    <div className="w-full">
      {/* Page Header */}
      <section className="px-4 sm:px-6 md:px-12 py-6 sm:py-10 bg-[var(--surface-color)] border-b border-[var(--border-color)] transition-colors duration-200">
        <div className="max-w-5xl mx-auto space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
            KEAM {exam.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Select a subject to view available question banks.
          </p>

          <SubjectSelector subjects={exam.subjects} />
        </div>
      </section>

      {/* Available Materials Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-10">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6">
          Available Materials
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {materials.map((mat) => (
            <MaterialItem key={mat.id} material={mat} />
          ))}
        </div>
      </section>
    </div>
  );
}
