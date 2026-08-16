import type { Metadata } from "next";
import { examService } from "@/lib/services/examService";
import { SubjectSelector } from "@/components/exams/SubjectSelector";
import { MaterialItem } from "@/components/exams/MaterialItem";

export const metadata: Metadata = {
  title: "NEET Study Materials | QuizStep",
  description: "Access curated NEET physics, chemistry, and biology question banks.",
};

export default function NeetPage() {
  const exam = examService.getExamBySlug("neet");
  const materials = examService.getMaterials("neet");

  if (!exam) return null;

  return (
    <div className="w-full">
      {/* Page Header */}
      <section className="px-6 md:px-12 py-10 bg-[var(--surface-color)] border-b border-[var(--border-color)] transition-colors duration-200">
        <div className="max-w-5xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            NEET {exam.fullName}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Select a subject to view available question banks.
          </p>

          <SubjectSelector subjects={exam.subjects} />
        </div>
      </section>

      {/* Available Materials Section */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-10">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
          Available Materials
        </h2>

        <div className="space-y-4">
          {materials.map((mat) => (
            <MaterialItem key={mat.id} material={mat} />
          ))}
        </div>
      </section>
    </div>
  );
}
