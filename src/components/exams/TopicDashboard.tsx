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
  const [doubtText, setDoubtText] = useState("");
  const [submittedDoubts, setSubmittedDoubts] = useState<Array<{ id: string; question: string; time: string }>>([]);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  const notes = examService.getTopicNotes(topic.name);
  const shortNotes = examService.getTopicShortNotes(topic.name);
  const doubtsList = examService.getTopicDoubts(topic.name);

  const handleDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;

    setSubmittedDoubts((prev) => [
      {
        id: `user-d-${Date.now()}`,
        question: doubtText.trim(),
        time: "Just now",
      },
      ...prev,
    ]);

    setDoubtText("");
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 4000);
  };

  const getTabUrl = (tabName: string) => {
    return `/${examSlug}?subject=${subject}&topic=${topic.id}&tab=${tabName}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Topic Title Header */}
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary-blue)] mb-1">
              <span>{subject}</span>
              <span>•</span>
              <span>{topic.category || "Chapter"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
              {topic.name}
            </h2>
          </div>
        </div>

        {/* Feature Navigation Tabs (Notes, Short Notes, Doubt Clearance) */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-[var(--border-color)]">
          <Link
            href={getTabUrl("notes")}
            scroll={false}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === "notes" || activeTab === "materials"
                ? "bg-[var(--primary-blue)] text-white shadow-sm"
                : "bg-[var(--tag-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-blue)]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Notes
          </Link>

          <Link
            href={getTabUrl("short-notes")}
            scroll={false}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === "short-notes"
                ? "bg-[var(--primary-blue)] text-white shadow-sm"
                : "bg-[var(--tag-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-blue)]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Short Notes
          </Link>

          <Link
            href={getTabUrl("doubts")}
            scroll={false}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === "doubts"
                ? "bg-[var(--primary-blue)] text-white shadow-sm"
                : "bg-[var(--tag-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-blue)]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Doubt Clearance
          </Link>
        </div>
      </div>

      {/* Tab Content Display */}
      {(activeTab === "notes" || activeTab === "materials") && (
        <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {notes.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Comprehensive reference material & topic summary
              </p>
            </div>
            <a
              href="#download"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[var(--primary-blue)] rounded-lg hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF Notes
            </a>
          </div>

          <div className="prose max-w-none text-sm text-[var(--text-primary)] space-y-4">
            <p className="leading-relaxed">{notes.content}</p>

            <div className="bg-[var(--tag-bg)] border-l-4 border-[var(--primary-blue)] p-4 rounded-r-lg space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--primary-blue)]">
                Key Learning Objectives & Takeaways
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-[var(--text-primary)]">
                {notes.keyPoints?.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "short-notes" && (
        <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="pb-4 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {shortNotes.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              High-yield summary & quick formula recall sheet
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <p className="text-[var(--text-primary)] leading-relaxed">
              {shortNotes.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--primary-blue)]">
                  Quick Memory Points
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--text-primary)]">
                  {shortNotes.keyPoints.map((kp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--primary-blue)] font-bold">•</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--primary-blue)]">
                  Important Keywords & Formulae
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {shortNotes.formulaeOrKeywords?.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[var(--tag-bg)] text-[var(--primary-blue)] border border-[var(--border-color)]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "doubts" && (
        <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Ask Your Doubt - {topic.name}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Submit your specific question regarding this topic to get expert resolution.
            </p>
          </div>

          {showSuccessMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Your doubt has been submitted successfully! Our expert educators will review it shortly.</span>
            </div>
          )}

          <form onSubmit={handleDoubtSubmit} className="space-y-3">
            <textarea
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              placeholder={`Type your doubt or question regarding ${topic.name} here...`}
              rows={3}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] transition-all resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!doubtText.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[var(--primary-blue)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Submit Doubt
              </button>
            </div>
          </form>

          {/* Submitted & Common Doubts List */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Frequently Asked Doubts & Answers
            </h4>

            {submittedDoubts.map((sd) => (
              <div key={sd.id} className="p-3.5 bg-[var(--tag-bg)] border border-[var(--border-color)] rounded-lg space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="font-bold text-[var(--primary-blue)]">Your Doubt</span>
                  <span>{sd.time}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                  {sd.question}
                </p>
                <div className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded w-fit font-medium border border-amber-200">
                  Status: Pending Educator Review
                </div>
              </div>
            ))}

            {doubtsList.map((d) => (
              <div key={d.id} className="p-3.5 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-secondary)]">Q&A Discussion</span>
                  <span>{d.createdAt}</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  Q: {d.question}
                </p>
                {d.answer && (
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] pl-3 border-l-2 border-[var(--primary-blue)]">
                    <strong className="text-[var(--primary-blue)] font-semibold">Answer: </strong>
                    {d.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
