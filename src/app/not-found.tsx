import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6 py-12 text-center">
      <div className="w-full max-w-xl p-8 sm:p-12 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl shadow-card">
        <div
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 text-[var(--primary-blue)] flex items-center justify-center text-3xl font-extrabold"
          aria-hidden="true"
        >
          🔍
        </div>

        <div className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--primary-blue)] to-[#0096c7] bg-clip-text text-transparent mb-3">
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3">
          Page Not Found
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md mx-auto">
          The study material, exam question bank, or page you are looking for might have been moved, renamed, or does not exist.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg bg-[var(--primary-blue)] !text-white hover:bg-[var(--primary-hover)] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Back to Home
          </Link>
          <Link
            href="/#exams"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg bg-transparent text-[var(--primary-blue)] border border-[var(--primary-blue)] hover:bg-[var(--tag-bg)] transition-all duration-200"
          >
            Browse Exams
          </Link>
        </div>

        <div className="pt-6 border-t border-[var(--border-color)]">
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-3">
            Looking for a specific entrance exam?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/jee"
              className="px-3 py-1 text-xs font-medium bg-[var(--tag-bg)] text-[var(--text-primary)] rounded-full hover:scale-105 transition-transform"
            >
              JEE Materials
            </Link>
            <Link
              href="/neet"
              className="px-3 py-1 text-xs font-medium bg-[var(--tag-bg)] text-[var(--text-primary)] rounded-full hover:scale-105 transition-transform"
            >
              NEET Materials
            </Link>
            <Link
              href="/keam"
              className="px-3 py-1 text-xs font-medium bg-[var(--tag-bg)] text-[var(--text-primary)] rounded-full hover:scale-105 transition-transform"
            >
              KEAM Materials
            </Link>
            <Link
              href="/cuet"
              className="px-3 py-1 text-xs font-medium bg-[var(--tag-bg)] text-[var(--text-primary)] rounded-full hover:scale-105 transition-transform"
            >
              CUET Materials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
