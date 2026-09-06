"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ChapterTopic, StudyMaterial } from "@/types/exam";
import { MaterialItem } from "@/components/exams/MaterialItem";
import { AddMaterialButton } from "@/components/admin/AddMaterialButton";

interface TopicDashboardProps {
  examSlug: string;
  subject: string;
  topic: ChapterTopic;
  activeTab: string;
  materials: StudyMaterial[];
}

export function TopicDashboard({ examSlug, subject, topic, activeTab, materials }: TopicDashboardProps) {
  const [doubtInput, setDoubtInput] = useState("");
  const [userDoubts, setUserDoubts] = useState<Array<{ id: string; question: string; time: string }>>([]);
  const [submitted, setSubmitted] = useState(false);

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

  const currentTab = activeTab || "notes";

  const getTabHref = (mode: string) => {
    return `/${examSlug}?subject=${encodeURIComponent(subject)}&topic=${topic.id}&tab=${mode}`;
  };

  return (
    <div className="space-y-5">
      {/* Topic Header & Minimal Tabs */}
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--primary-blue)]">
              {subject} • {topic.category || "General Topic"}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] mt-0.5">
              {topic.name}
            </h2>
          </div>
        </div>

        {/* Minimal Navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-[var(--border-color)] overflow-x-auto">
          {[
            { id: "notes", label: "Notes", icon: "📖" },
            { id: "short-notes", label: "Short Notes", icon: "⚡" },
            { id: "doubts", label: "Doubt Clearance", icon: "❓" },
            { id: "materials", label: "Question Banks", icon: "📑" },
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={getTabHref(tab.id)}
                scroll={false}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 ${
                  isActive
                    ? "bg-[var(--primary-blue)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 1. Notes View */}
      {currentTab === "notes" && (
        <section className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Study Modules & Notes
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--tag-bg)] text-[var(--primary-blue)] font-medium border border-[var(--border-color)]">
              {topic.name}
            </span>
          </div>

          <div className="py-8 text-center text-xs sm:text-sm text-[var(--text-secondary)] space-y-1">
            <p className="font-semibold text-[var(--text-primary)]">Notes modules for {topic.name}</p>
            <p>Module materials will be displayed here as they are published.</p>
          </div>
        </section>
      )}

      {/* 2. Short Notes View */}
      {currentTab === "short-notes" && (
        <section className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Short Revision Notes
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Quick review points for {topic.name}
            </p>
          </div>

          <div className="py-6 text-center text-xs sm:text-sm text-[var(--text-secondary)] space-y-1">
            <p className="font-semibold text-[var(--text-primary)]">Short revision notes for {topic.name}</p>
            <p>Quick recall formulas and key points will appear here.</p>
          </div>
        </section>
      )}

      {/* 3. Doubt Clearance View */}
      {currentTab === "doubts" && (
        <section className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Ask Your Doubt
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Submit your question regarding {topic.name}
            </p>
          </div>

          {submitted && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Your doubt has been submitted successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmitDoubt} className="space-y-3">
            <textarea
              value={doubtInput}
              onChange={(e) => setDoubtInput(e.target.value)}
              placeholder={`Type your doubt regarding ${topic.name}...`}
              rows={3}
              className="w-full p-3.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] transition-all resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!doubtInput.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[var(--primary-blue)] rounded-xl hover:opacity-90 disabled:opacity-40 transition-all"
              >
                Submit Doubt
              </button>
            </div>
          </form>

          {userDoubts.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[var(--border-color)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Your Submitted Doubts
              </h4>
              {userDoubts.map((ud) => (
                <div key={ud.id} className="p-3.5 bg-[var(--tag-bg)] border border-[var(--border-color)] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--primary-blue)]">Submitted Question</span>
                    <span>{ud.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                    {ud.question}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. Question Banks View */}
      {currentTab === "materials" && (
        <section className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Available Question Banks
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Practice papers & question collections for {subject}
              </p>
            </div>
            <AddMaterialButton />
          </div>

          {materials.length > 0 ? (
            <div className="space-y-3">
              {materials.map((mat) => (
                <MaterialItem key={mat.id} material={mat} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
              No question banks available yet.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
