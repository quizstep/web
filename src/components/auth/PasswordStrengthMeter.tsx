import React from "react";
import type { PasswordEvaluation } from "@/types/auth";

export interface PasswordStrengthMeterProps {
  evaluation: PasswordEvaluation;
  show: boolean;
}

export function PasswordStrengthMeter({ evaluation, show }: PasswordStrengthMeterProps) {
  if (!show) return null;

  const getWidthPercent = (score: number) => {
    switch (score) {
      case 1:
        return "25%";
      case 2:
        return "50%";
      case 3:
        return "75%";
      case 4:
        return "100%";
      default:
        return "0%";
    }
  };

  const getColorClass = (score: number) => {
    switch (score) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-amber-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-emerald-500";
      default:
        return "bg-slate-300";
    }
  };

  return (
    <div className="w-full space-y-1.5 pt-1 text-xs" aria-live="polite">
      {/* Progress Bar Container */}
      <div className="w-full h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${getColorClass(evaluation.score)}`}
          style={{ width: getWidthPercent(evaluation.score) }}
        />
      </div>

      {/* Label and Hint */}
      <div className="flex justify-between items-center text-[var(--text-secondary)]">
        <span>
          Strength:{" "}
          <strong className={evaluation.score >= 3 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
            {evaluation.label}
          </strong>
        </span>
        {evaluation.hint && <span className="text-[11px] opacity-80">{evaluation.hint}</span>}
      </div>
    </div>
  );
}
