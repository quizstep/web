"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { examService } from "@/lib/services/examService";
import type { ExamInfo } from "@/types/exam";
import { SubjectSelector } from "@/components/exams/SubjectSelector";
import { CourseMenuSidebar } from "@/components/exams/CourseMenuSidebar";
import { ChapterSelector } from "@/components/exams/ChapterSelector";
import { TopicDashboard } from "@/components/exams/TopicDashboard";
import { MaterialItem } from "@/components/exams/MaterialItem";
import { AddMaterialButton } from "@/components/admin/AddMaterialButton";

interface ExamPageContentProps {
  exam: ExamInfo;
}

function ExamPageContentInner({ exam }: ExamPageContentProps) {
  const searchParams = useSearchParams();

  const currentSubject = searchParams.get("subject") || exam.subjects[0] || "Biology";
  const tab = searchParams.get("tab") || "all";

  const topics = examService.getTopicsBySubject(currentSubject);

  const activeTopicId = searchParams.get("topic") || (topics[0]?.id ?? "");
  const activeTopic = topics.find((t) => t.id === activeTopicId) || topics[0];

  const materials = examService.getMaterials(exam.slug);

  const isMaterialsTab = tab === "materials";
  const isCustomTabNotFound = !["all", "notes", "short-notes", "doubts", "materials"].includes(tab);

  return (
    <div className="w-full">
      {/* Header Banner */}
      <section className="px-4 sm:px-6 md:px-12 py-6 sm:py-8 bg-[var(--surface-color)] border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-blue)]">
              {exam.name} Exam Preparation
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
              {exam.name} {exam.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Select a subject and chapter to access study notes, revision sheets, and doubt clearance.
            </p>
          </div>

          <SubjectSelector subjects={exam.subjects} />
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Area */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            <CourseMenuSidebar examSlug={exam.slug} currentSubject={currentSubject} />
            
            {topics.length > 0 && (
              <ChapterSelector
                examSlug={exam.slug}
                subject={currentSubject}
                topics={topics}
              />
            )}
          </div>

          {/* Main Content Dashboard */}
          <div className="flex-1 min-w-0">
            {isMaterialsTab ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                      Available Question Banks
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Download practice papers & question collections for {exam.name}
                    </p>
                  </div>
                  <AddMaterialButton />
                </div>

                {materials.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {materials.map((mat) => (
                      <MaterialItem key={mat.id} material={mat} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--surface-color)] text-center">
                    <svg className="w-10 h-10 text-[var(--text-secondary)] mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                      Materials Not Found
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] max-w-xs">
                      We are currently preparing question banks for this section.
                    </p>
                  </div>
                )}
              </div>
            ) : isCustomTabNotFound ? (
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
            ) : activeTopic ? (
              <TopicDashboard
                examSlug={exam.slug}
                subject={currentSubject}
                topic={activeTopic}
                activeTab={tab}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ExamPageContent({ exam }: ExamPageContentProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full py-20 text-center text-sm text-[var(--text-secondary)]">
          Loading {exam.name} course materials...
        </div>
      }
    >
      <ExamPageContentInner exam={exam} />
    </Suspense>
  );
}
