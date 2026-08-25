"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const examLinks = [
    { name: "JEE", href: "/jee" },
    { name: "NEET", href: "/neet" },
    { name: "KEAM", href: "/keam" },
    { name: "CUET", href: "/cuet" },
  ];

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full bg-[var(--surface-color)]/95 backdrop-blur-md border-b border-[var(--border-color)] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-12 py-3">
        {/* Brand Logo - Non-clickable as explicitly requested */}
        <div className="flex items-center gap-2.5 cursor-default select-none shrink-0">
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
          <span className="font-bold text-lg sm:text-xl tracking-tight text-[var(--primary-blue)] pointer-events-none">
            QuizStep
          </span>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Navigation Links (Visible on md and up) */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-[var(--primary-blue)] ${
                pathname === "/" ? "text-[var(--primary-blue)] font-semibold" : "text-[var(--text-primary)]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/#exams"
              className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary-blue)] transition-colors"
            >
              Exams
            </Link>
          </nav>

          {/* Theme Toggle Icon (Visible on all screens) */}
          <ThemeToggle />

          {/* Direct Auth State Slot (Directly visible on both Desktop & Mobile) */}
          <div id="auth-nav-slot" className="flex items-center">
            {!isLoading && user ? (
              <div className="flex items-center">
                {/* On small/medium+ screens: full UserMenu with logout button */}
                <div className="hidden sm:flex">
                  <UserMenu user={user} onLogout={logout} />
                </div>
                {/* On extra-small screens: compact avatar badge */}
                <div className="flex sm:hidden items-center">
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--primary-blue)] to-[#0096c7] text-white flex items-center justify-center font-bold text-xs shadow-sm"
                    title={user.email}
                    aria-label={`Signed in as ${user.fullName || user.email}`}
                  >
                    {(user.fullName ? user.fullName.charAt(0) : user.email.charAt(0) || "U").toUpperCase()}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-[var(--primary-blue)] !text-white hover:bg-[var(--primary-hover)] active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
                id="login-btn"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button (Visible below md) */}
          <button
            type="button"
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--tag-bg)] hover:text-[var(--primary-blue)] transition-colors focus:outline-none shrink-0"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              // Close "X" icon
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer (Smooth slide-down dropdown) */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[var(--border-color)] bg-[var(--surface-color)] px-4 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200"
        >
          {/* Primary Navigation Links */}
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-[var(--tag-bg)] text-[var(--primary-blue)] font-semibold"
                  : "text-[var(--text-primary)] hover:bg-[var(--tag-bg)]"
              }`}
            >
              <span>Home</span>
              <svg className="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>

            <Link
              href="/#exams"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--tag-bg)] transition-colors"
            >
              <span>All Exams</span>
              <svg className="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          {/* Exam Hub Quick Access */}
          <div className="pt-2 border-t border-[var(--border-color)]">
            <p className="px-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Exam Portals
            </p>
            <div className="grid grid-cols-2 gap-2">
              {examLinks.map((exam) => {
                const isActive = pathname.startsWith(exam.href);
                return (
                  <Link
                    key={exam.name}
                    href={exam.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-center py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      isActive
                        ? "border-[var(--primary-blue)] bg-[var(--primary-blue)] !text-white shadow-sm"
                        : "border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--surface-color)] hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)]"
                    }`}
                  >
                    {exam.name} Hub
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Auth Section */}
          <div className="pt-3 border-t border-[var(--border-color)]">
            {!isLoading && user ? (
              <div className="space-y-3">
                {/* User Card */}
                <div className="flex items-center gap-3 p-3 bg-[var(--tag-bg)] rounded-lg">
                  <div
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--primary-blue)] to-[#0096c7] text-white flex items-center justify-center font-bold text-sm shrink-0"
                    aria-hidden="true"
                  >
                    {(user.fullName ? user.fullName.charAt(0) : user.email.charAt(0) || "U").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {user.fullName || user.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Log Out Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4 stroke-current"
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
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 text-sm font-semibold rounded-lg bg-[var(--primary-blue)] !text-white hover:bg-[var(--primary-hover)] transition-all shadow-sm text-center"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 text-sm font-semibold rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--tag-bg)] transition-colors text-center"
                >
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

