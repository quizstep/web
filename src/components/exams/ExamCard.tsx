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
      className="group relative block p-6 sm:p-7 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-500/50 hover:-translate-y-1.5 transition-all duration-250 text-left overflow-hidden"
    >
      {/* Top accent light glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--primary-blue)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {exam.name}
        </h3>
        <div className="w-8 h-8 rounded-xl bg-[var(--tag-bg)] flex items-center justify-center text-xs font-bold text-[var(--primary-blue)] group-hover:bg-[var(--primary-blue)] group-hover:text-white transition-all">
          →
        </div>
      </div>

      <p className="text-xs text-[var(--text-secondary)] mb-6 line-clamp-2 leading-relaxed">
        {exam.fullName}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
        {exam.subjects.map((subject) => (
          <span
            key={subject}
            className="px-2.5 py-1 text-[11px] font-semibold bg-[var(--tag-bg)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)] group-hover:border-blue-500/20 transition-colors"
          >
            {subject}
          </span>
        ))}
      </div>
    </Link>
  );
}
