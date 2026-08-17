"use client";

import React from "react";
import type { StudyMaterial } from "@/types/exam";
import { Button } from "@/components/ui/Button";

export interface MaterialItemProps {
  material: StudyMaterial;
  onUnlock?: (material: StudyMaterial) => void;
}

export function MaterialItem({ material, onUnlock }: MaterialItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-sm hover:border-[var(--primary-blue)]/50 transition-colors duration-200">
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-[var(--text-primary)]">
          {material.title}
        </h4>
        <p className="text-xs text-[var(--text-secondary)]">
          {material.subject} • {material.questionCount} Questions
        </p>
      </div>

      <div className="shrink-0">
        <Button
          type="button"
          variant="unlock"
          size="sm"
          onClick={() => onUnlock?.(material)}
          className="w-full sm:w-auto"
        >
          Unlock / View
        </Button>
      </div>
    </div>
  );
}
