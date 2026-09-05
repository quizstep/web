"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ChapterTopic } from "@/types/exam";

interface ChapterSelectorProps {
  examSlug: string;
  subject: string;
  topics: ChapterTopic[];
}

export function ChapterSelector({ examSlug, subject, topics }: ChapterSelectorProps) {
  const searchParams = useSearchParams();
  const activeTopicId = searchParams.get("topic") || (topics[0]?.id ?? "");

  // Group topics by category (e.g. Class XI Botany, Class XI Zoology, Class XI Chemistry, etc.)
  const categories = Array.from(new Set(topics.map((t) => t.category || "General Topics")));

  return (
    <div className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary-blue)]">
            Select Topic / Chapter
          </span>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {subject} Syllabus
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--tag-bg)] text-[var(--text-secondary)] font-medium">
          {topics.length} Chapters
        </span>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-1 space-y-4 text-sm scrollbar-thin">
        {categories.map((cat) => {
          const categoryTopics = topics.filter((t) => (t.category || "General Topics") === cat);
          return (
            <div key={cat} className="space-y-1.5">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-2 pt-1">
                {cat}
              </h4>
              <div className="space-y-1">
                {categoryTopics.map((topic) => {
                  const isActive = activeTopicId === topic.id;
                  const currentParams = new URLSearchParams(searchParams.toString());
                  currentParams.set("topic", topic.id);
                  if (!currentParams.has("tab")) {
                    currentParams.set("tab", "notes");
                  }
                  const href = `/${examSlug}?${currentParams.toString()}`;

                  return (
                    <Link
                      key={topic.id}
                      href={href}
                      scroll={false}
                      className={`block px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-[var(--primary-blue)] text-white shadow-sm font-semibold"
                          : "text-[var(--text-primary)] hover:bg-[var(--tag-bg)] hover:text-[var(--primary-blue)]"
                      }`}
                    >
                      {topic.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
