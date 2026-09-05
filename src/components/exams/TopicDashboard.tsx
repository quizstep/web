"use client";

import React, { useState } from "react";
import Link from "next/link";
import { examService } from "@/lib/services/examService";
import type { ChapterTopic } from "@/types/exam";

interface TopicDashboardProps {
  examSlug: string;
  subject: string;
  topic: ChapterTopic;
  activeTab: string;
}

export function TopicDashboard({ examSlug, subject, topic, activeTab }: TopicDashboardProps) {
  const [doubtInput, setDoubtInput] = useState("");
  const [userDoubts, setUserDoubts] = useState<Array<{ id: string; question: string; time: string }>>([]);
  const [submitted, setSubmitted] = useState(false);

  const notes = examService.getTopicNotes(topic.name);
  const shortNotes = examService.getTopicShortNotes(topic.name);
  const doubtsList = examService.getTopicDoubts(topic.name);

  const handleSubmitDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtInput.trim()) return;

    setUserDoubts((prev) => [
      { id: `d-${Date.now()}`, question: doubtInput.trim(), time: "Just now" },
      ...prev,
    ]);
    setDoubtInput("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const currentTab = activeTab || "all";

  const getTabHref = (mode: string) => {
    return `/${examSlug}?subject=${encodeURIComponent(subject)}&topic=${topic.id}&tab=${mode}`;
  };

  const showNotes = currentTab === "all" || currentTab === "notes" || currentTab === "materials";
  const showShortNotes = currentTab === "all" || currentTab === "short-notes";
  const showDoubts = currentTab === "all" || currentTab === "doubts";

  return (
    <div className="space-y-6">
      {/* Chapter Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-blue-200">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
                {subject}
              </span>
              <span>•</span>
              <span>{topic.category || "General Topic"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {topic.name}
            </h2>
            <p className="text-sm text-blue-100/90 max-w-xl">
              Complete study bundle including detailed theory notes, formula summaries, and 1-on-1 doubt clearance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#download"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-blue-900 bg-white rounded-xl shadow-md hover:bg-blue-50 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </a>
          </div>
        </div>

        {/* Subtle decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      </div>

      {/* View Switcher Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl overflow-x-auto">
        {[
          { id: "all", label: "All Content", icon: "📑" },
          { id: "notes", label: "Notes", icon: "📖" },
          { id: "short-notes", label: "Short Notes", icon: "⚡" },
          { id: "doubts", label: "Doubt Clearance", icon: "❓" },
        ].map((item) => {
          const isActive = currentTab === item.id;
          return (
            <Link
              key={item.id}
              href={getTabHref(item.id)}
              scroll={false}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 ${
                isActive
                  ? "bg-[var(--primary-blue)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)]"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 1. Detailed Notes Card */}
      {showNotes && (
        <section className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
                📖
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Detailed Notes & Theory
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Comprehensive topic breakdown & core mechanisms
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--tag-bg)] text-[var(--primary-blue)] font-semibold border border-[var(--border-color)]">
              Verified Study Notes
            </span>
          </div>

          <div className="space-y-4 text-sm text-[var(--text-primary)] leading-relaxed">
            <p className="text-base font-medium text-[var(--text-primary)]">
              {notes.content}
            </p>

            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Core Concepts & Key Objectives
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {notes.keyPoints?.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 bg-white/80 p-2.5 rounded-lg border border-blue-100/80 shadow-2xs">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Short Notes Card */}
      {showShortNotes && (
        <section className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base shrink-0">
                ⚡
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Short Revision Notes
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  High-yield takeaways & rapid review sheet
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
              Quick Recall
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {shortNotes.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="text-amber-500">📌</span> High-Yield Facts
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-primary)]">
                  {shortNotes.keyPoints.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="text-indigo-500">🔑</span> Formulas & Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {shortNotes.formulaeOrKeywords?.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Doubt Clearance Box */}
      {showDoubts && (
        <section className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base shrink-0">
                ❓
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Doubt Clearance Corner
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Have a question on {topic.name}? Ask directly to expert mentors.
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              Active Mentor Support
            </span>
          </div>

          {submitted && (
            <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Your doubt has been logged successfully! An educator will review and answer it shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmitDoubt} className="space-y-3">
            <textarea
              value={doubtInput}
              onChange={(e) => setDoubtInput(e.target.value)}
              placeholder={`Ask any specific question or formula query related to ${topic.name}...`}
              rows={3}
              className="w-full p-4 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none shadow-2xs"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!doubtInput.trim()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all shadow-sm active:scale-95"
              >
                Submit Doubt
              </button>
            </div>
          </form>

          {/* Discussion List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Resolved & Past Doubts
            </h4>

            {userDoubts.map((ud) => (
              <div key={ud.id} className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-blue-700">
                  <span className="font-bold">Your Question</span>
                  <span>{ud.time}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900">
                  {ud.question}
                </p>
                <span className="inline-block text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-md">
                  Status: Pending Mentor Response
                </span>
              </div>
            ))}

            {doubtsList.map((item) => (
              <div key={item.id} className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-secondary)]">Community Q&A</span>
                  <span>{item.createdAt}</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  Q: {item.question}
                </p>
                {item.answer && (
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-blue-600 leading-relaxed">
                    <strong className="text-blue-600 font-semibold">Answer: </strong>
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
