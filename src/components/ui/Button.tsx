import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "unlock" | "icon" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, loadingText, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-65 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary:
        "bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-md active:translate-y-0 text-white !text-white",
      secondary:
        "bg-transparent text-[var(--primary-blue)] border border-[var(--border-color)] hover:bg-[var(--tag-bg)] hover:text-[var(--primary-hover)]",
      unlock:
        "btn-unlock bg-transparent text-[var(--primary-blue)] border-[1.5px] border-[var(--primary-blue)] hover:bg-[var(--primary-blue)] hover:text-white dark:text-[#93c5fd] dark:border-[#3b82f6] dark:bg-[rgba(59,130,246,0.12)] dark:hover:bg-[#3b82f6] dark:hover:text-white shadow-sm hover:shadow-md",
      outline:
        "bg-transparent border border-[var(--primary-blue)] text-[var(--primary-blue)] hover:bg-[var(--tag-bg)]",
      icon:
        "p-2 bg-transparent text-[var(--text-primary)] hover:bg-[var(--tag-bg)] hover:text-[var(--primary-blue)] rounded-lg",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2 text-sm",
      lg: "px-8 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          variant !== "icon" && sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span
            className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"
            aria-hidden="true"
          />
        )}
        {isLoading && loadingText ? loadingText : children}
      </button>
    );
  }
);

Button.displayName = "Button";
