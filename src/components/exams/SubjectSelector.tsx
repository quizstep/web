"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export interface SubjectSelectorProps {
  subjects: string[];
  activeSubject?: string;
  onSelectSubject?: (subject: string) => void;
}

export function SubjectSelector({
  subjects,
  activeSubject,
  onSelectSubject,
}: SubjectSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2.5 my-4">
      {subjects.map((subject) => {
        const isActive = activeSubject === subject;
        return (
          <Button
            key={subject}
            type="button"
            variant="primary"
            onClick={() => onSelectSubject?.(subject)}
            className={`text-xs sm:text-sm px-3.5 sm:px-5 py-1.5 sm:py-2 transition-all ${
              isActive
                ? "ring-2 ring-offset-2 ring-[var(--primary-blue)] shadow-sm"
                : ""
            }`}
          >
            {subject}
          </Button>
        );
      })}
    </div>
  );
}
