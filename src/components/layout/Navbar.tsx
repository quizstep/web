"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-3.5 bg-[var(--surface-color)] border-b border-[var(--border-color)] transition-colors duration-200">
      {/* Brand Logo - Non-clickable as explicitly requested */}
      <div className="flex items-center gap-2.5 cursor-default select-none">
        <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
          <Image
            src="/images/logo-icon.png"
            alt="QuizStep Logo"
            width={32}
            height={32}
            className="object-contain pointer-events-none"
            priority
          />
        </div>
        <span className="font-bold text-xl tracking-tight text-[var(--primary-blue)] pointer-events-none">
          QuizStep
        </span>
      </div>

      {/* Navigation & Controls */}
      <nav className="flex items-center gap-4 md:gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary-blue)] transition-colors"
        >
          Home
        </Link>
        <Link
          href="/#exams"
          className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary-blue)] transition-colors"
        >
          Exams
        </Link>

        {/* Theme Toggle Icon */}
        <ThemeToggle />

        {/* Dynamic Auth State Slot */}
        <div id="auth-nav-slot" className="flex items-center min-h-[36px]">
          {!isLoading && user ? (
            <UserMenu user={user} onLogout={logout} />
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-semibold rounded-md bg-[var(--primary-blue)] !text-white hover:bg-[var(--primary-hover)] transition-all duration-200 shadow-sm hover:shadow-md"
              id="login-btn"
            >
              Log In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
