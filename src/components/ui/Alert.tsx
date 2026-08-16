import React from "react";
import { cn } from "@/lib/utils/cn";

export interface AlertProps {
  type?: "error" | "success" | "info";
  message: string;
  className?: string;
}

export function Alert({ type = "error", message, className }: AlertProps) {
  if (!message) return null;

  const typeStyles = {
    error:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60",
    success:
      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    info:
      "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  };

  return (
    <div
      role="alert"
      className={cn(
        "p-3 rounded-lg border text-sm font-medium transition-all duration-200",
        typeStyles[type],
        className
      )}
    >
      {message}
    </div>
  );
}
