"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

export interface SubjectSelectorProps {
  subjects: string[];
  activeSubject?: string;
  onSelectSubject?: (subject: string) => void;
}

export function SubjectSelector({
  subjects,
  activeSubject: propActiveSubject,
}: SubjectSelectorProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSubject = propActiveSubject || searchParams.get("subject") || subjects[0] || "Biology";

  return (
    <div className="flex flex-wrap gap-2.5 my-3">
      {subjects.map((subject) => {
        const isActive = currentSubject.toLowerCase() === subject.toLowerCase();
        
        // Build URL for subject selection
        const params = new URLSearchParams();
        params.set("subject", subject);
        const tab = searchParams.get("tab");
        if (tab) params.set("tab", tab);
        const href = `${pathname}?${params.toString()}`;

        return (
          <Link
            key={subject}
            href={href}
            scroll={false}
            className={`inline-flex items-center justify-center text-xs sm:text-sm font-bold px-4 py-2 rounded-lg transition-all ${
              isActive
                ? "bg-[var(--primary-blue)] text-white shadow-md ring-2 ring-[var(--primary-blue)] ring-offset-2"
                : "bg-[var(--surface-color)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--tag-bg)] hover:text-[var(--primary-blue)]"
            }`}
          >
            {subject}
          </Link>
        );
      })}
    </div>
  );
}
