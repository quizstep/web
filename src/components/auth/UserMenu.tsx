"use client";

import React from "react";
import type { AuthUser } from "@/types/auth";

export interface UserMenuProps {
  user: AuthUser;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const displayName = user.fullName || user.email.split("@")[0] || "Student";
  const initial = (user.fullName ? user.fullName.charAt(0) : user.email.charAt(0) || "U").toUpperCase();

  return (
    <div className="flex items-center gap-2">
      {/* User Badge */}
      <div
        className="flex items-center gap-2 px-2.5 py-1 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-full shadow-sm max-w-[180px] sm:max-w-none"
        title={user.email}
      >
        <div
          className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--primary-blue)] to-[#0096c7] text-white flex items-center justify-center font-bold text-xs shrink-0"
          aria-hidden="true"
        >
          {initial}
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[100px] sm:max-w-[150px]">
          {displayName}
        </span>
      </div>

      {/* Log Out Button */}
      <button
        type="button"
        id="logout-btn"
        onClick={onLogout}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-transparent hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white border border-red-200 dark:border-red-800/80 rounded-md transition-all duration-200 shadow-sm"
        title="Log out of your account"
      >
        <svg
          className="w-3.5 h-3.5 stroke-current"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span className="hidden sm:inline">Log Out</span>
      </button>
    </div>
  );
}
