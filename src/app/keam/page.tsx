import type { Metadata } from "next";
import { examService } from "@/lib/services/examService";
import { SubjectSelector } from "@/components/exams/SubjectSelector";
import { MaterialItem } from "@/components/exams/MaterialItem";
import { CourseMenuSidebar } from "@/components/exams/CourseMenuSidebar";
import { AddMaterialButton } from "@/components/admin/AddMaterialButton";

export const metadata: Metadata = {
  title: "KEAM Study Materials | QuizStep",
  description: "Access curated KEAM engineering, architecture, and medical question banks.",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function KeamPage({ searchParams }: PageProps) {
  const exam = examService.getExamBySlug("keam");
  const materials = examService.getMaterials("keam");

  if (!exam) return null;

  const params = await searchParams;
  const tab = typeof params.tab === "string" ? params.tab : "materials";

  // When clicking on unbuilt menu items, we show a friendly message
  const isMaterialsTab = !tab || tab === "materials";

  return (
    <div className="w-full">
      {/* Page Header */}
      <section className="px-4 sm:px-6 md:px-12 py-6 sm:py-10 bg-[var(--surface-color)] border-b border-[var(--border-color)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
            KEAM {exam.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Select a subject to view available question banks.
          </p>

          <SubjectSelector subjects={exam.subjects} />
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <CourseMenuSidebar examSlug="keam" />

          {/* Tab Content Section */}
          <div className="flex-1 space-y-4">
            {isMaterialsTab ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                    Available Materials
                  </h2>
                  <AddMaterialButton />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {materials.map((mat) => (
                    <MaterialItem key={mat.id} material={mat} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--surface-color)] text-center">
                <svg
                  className="w-12 h-12 text-[var(--text-secondary)] mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Materials Not Found
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                  We are currently preparing the content for this section. Please check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
