import React from "react";
import Link from "next/link";
import { examService } from "@/lib/services/examService";
import { ExamCard } from "@/components/exams/ExamCard";

export default function HomePage() {
  const exams = examService.getAllExams();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="text-center py-20 px-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
          Focused Study Materials for Entrance Exams
        </h1>
        <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Access highly relevant, affordable question banks tailored for engineering and medical entrance examinations.
        </p>
        <div className="pt-2">
          <Link
            href="#exams"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-lg bg-[var(--primary-blue)] !text-white hover:bg-[var(--primary-hover)] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Browse Materials
          </Link>
        </div>
      </section>

      {/* Select Your Exam Section */}
      <section id="exams" className="max-w-6xl mx-auto px-6 py-12 text-center scroll-mt-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-10">
          Select Your Exam
        </h2>

        {/* 4-column Grid matching exact original responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.slug} exam={exam} />
          ))}
        </div>
      </section>
    </div>
  );
}
