import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  optional?: boolean;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, optional, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <div className="flex justify-between items-center text-sm font-medium text-[var(--text-primary)]">
            <label htmlFor={inputId}>{label}</label>
            {optional && <span className="text-xs text-[var(--text-secondary)] font-normal">(Optional)</span>}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 bg-[var(--surface-color)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg text-sm transition-colors duration-200 placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--primary-blue)]/20",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-[var(--text-secondary)] mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
