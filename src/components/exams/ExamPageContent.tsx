"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { examService } from "@/lib/services/examService";
import type { ExamInfo } from "@/types/exam";
import { ChapterSelector } from "@/components/exams/ChapterSelector";
import { TopicDashboard } from "@/components/exams/TopicDashboard";

interface ExamPageContentProps {
  exam: ExamInfo;
}

function ExamPageContentInner({ exam }: ExamPageContentProps) {
  const searchParams = useSearchParams();

  const selectedSubject = searchParams.get("subject");
  const tab = searchParams.get("tab") || "notes";

  // Validate selectedSubject against exam.subjects
  const validSubject = exam.subjects.find(
    (s) => s.toLowerCase() === (selectedSubject || "").toLowerCase()
  );

  // If no subject has been selected yet or invalid subject for this exam, render Subject Selection View
  if (!selectedSubject || !validSubject) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-blue)]">
            {exam.name} Exam Preparation
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            Select Your Subject
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Choose a subject to access its dedicated chapters, study notes, and doubt clearance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {exam.subjects.map((subject) => (
            <Link
              key={subject}
              href={`/${exam.slug}?subject=${encodeURIComponent(subject)}`}
              scroll={false}
              className="group block p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500/50 hover:-translate-y-1 transition-all text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-50 text-[var(--primary-blue)] flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                {subject === "Biology" ? "🧬" : subject === "Chemistry" ? "🧪" : subject === "Physics" ? "⚛️" : "📐"}
              </div>
              <h3 className="text-lg font-extrabold text-[var(--text-primary)] group-hover:text-[var(--primary-blue)] transition-colors">
                {subject}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                View Chapters & Modules →
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Once a valid subject is selected, load its exam-scoped topics
  const currentSubject = validSubject;
  const topics = examService.getTopicsBySubject(currentSubject, exam.slug);

  const activeTopicId = searchParams.get("topic") || (topics[0]?.id ?? "");
  const activeTopic = topics.find((t) => t.id === activeTopicId) || topics[0];

  const materials = examService.getMaterials(exam.slug);

  return (
    <div className="w-full">
      {/* Locked Subject Header (No subject switcher top bar once inside) */}
      <section className="px-4 sm:px-6 md:px-12 py-5 sm:py-6 bg-[var(--surface-color)] border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/${exam.slug}`}
                scroll={false}
                className="text-xs font-semibold text-[var(--primary-blue)] hover:underline flex items-center gap-1"
              >
                ← Change Subject
              </Link>
              <span className="text-xs text-[var(--text-secondary)]">•</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {exam.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
              {currentSubject} Syllabus & Modules
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--tag-bg)] text-[var(--primary-blue)] border border-[var(--border-color)]">
              {currentSubject} Focused Mode
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Area: Chapters & Topics Search & Accordions */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            {topics.length > 0 && (
              <ChapterSelector
                examSlug={exam.slug}
                subject={currentSubject}
                topics={topics}
              />
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeTopic ? (
              <TopicDashboard
                examSlug={exam.slug}
                subject={currentSubject}
                topic={activeTopic}
                activeTab={tab}
                materials={materials}
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
