import React from "react";
import Link from "next/link";
import type { ExamInfo } from "@/types/exam";

export interface ExamCardProps {
  exam: ExamInfo;
}

export function ExamCard({ exam }: ExamCardProps) {
  return (
    <Link
      href={`/${exam.slug}`}
      className="group block p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 text-left"
    >
      <h3 className="text-xl font-bold text-[var(--primary-blue)] group-hover:text-[var(--primary-hover)] transition-colors">
        {exam.name}
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">
        {exam.fullName}
      </p>

      {/* Subject Tags */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {exam.subjects.map((subject) => (
          <span
            key={subject}
            className="px-2.5 py-0.5 text-xs font-medium bg-[var(--tag-bg)] text-[var(--text-primary)] rounded-full"
          >
            {subject}
          </span>
        ))}
      </div>
    </Link>
  );
}
