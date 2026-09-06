import React from "react";
import Link from "next/link";
import { examService } from "@/lib/services/examService";
import { ExamCard } from "@/components/exams/ExamCard";

export default function HomePage() {
  const exams = examService.getAllExams();

  return (
    <div className="w-full space-y-12 sm:space-y-20 pb-20">
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden text-center py-16 sm:py-28 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="space-y-6 sm:space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--tag-bg)] border border-[var(--border-color)] text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--primary-blue)]">
            <span>✦</span>
            <span>Entrance Exam Preparation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.12]">
            Focused Study Materials for Entrance Exams
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Access highly relevant, affordable question banks tailored for engineering and medical entrance examinations.
          </p>

          <div className="pt-2">
            <a
              href="#exams"
              className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 !text-white shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              <span>Browse Materials</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Decorative ambient radial background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Select Your Exam Section */}
      <section id="exams" className="max-w-6xl mx-auto px-4 sm:px-6 text-center scroll-mt-24 space-y-8 sm:space-y-12">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Select Your Exam
          </h2>
          <div className="w-12 h-1 bg-[var(--primary-blue)] rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.slug} exam={exam} />
          ))}
        </div>
      </section>
    </div>
  );
}
