"use client";

import React, { useState, useMemo } from "react";
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

  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    return Array.from(new Set(topics.map((t) => t.category || "General Topics")));
  }, [topics]);

  const activeTopicCategory = useMemo(() => {
    const found = topics.find((t) => t.id === activeTopicId);
    return found?.category || categories[0];
  }, [topics, activeTopicId, categories]);

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const query = searchQuery.toLowerCase().trim();
    return topics.filter((t) => t.name.toLowerCase().includes(query) || (t.category && t.category.toLowerCase().includes(query)));
  }, [topics, searchQuery]);

  return (
    <div className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-blue)]">
            Chapters & Topics
          </span>
          <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
            {subject} Syllabus
          </h3>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--tag-bg)] text-[var(--text-secondary)] font-semibold border border-[var(--border-color)]">
          {topics.length} Topics
        </span>
      </div>

      {/* Quick Search & Filter Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${subject} chapters...`}
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] transition-all"
        />
        <svg
          className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Chapter List / Accordions */}
      <div className="max-h-[440px] overflow-y-auto pr-1 space-y-3 text-sm scrollbar-thin">
        {filteredTopics.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
            No chapters found matching "{searchQuery}"
          </div>
        ) : (
          categories.map((cat) => {
            const categoryTopics = filteredTopics.filter((t) => (t.category || "General Topics") === cat);
            if (categoryTopics.length === 0) return null;

            // Expand if user explicitly expanded or if searching
            const isExpanded = !!searchQuery.trim() || !!expandedCategories[cat];
            const hasActiveTopic = categoryTopics.some((t) => t.id === activeTopicId);

            return (
              <div key={cat} className="border border-[var(--border-color)] rounded-xl overflow-hidden">
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold transition-all text-left ${
                    hasActiveTopic
                      ? "bg-[var(--tag-bg)] text-[var(--primary-blue)]"
                      : "bg-[var(--surface-color)] text-[var(--text-primary)] hover:bg-[var(--tag-bg)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>{cat}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-secondary)] font-semibold">
                    {categoryTopics.length}
                  </span>
                </button>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-1.5 space-y-1 bg-[var(--surface-color)] border-t border-[var(--border-color)]">
                    {categoryTopics.map((topic) => {
                      const isActive = activeTopicId === topic.id;
                      const currentParams = new URLSearchParams(searchParams.toString());
                      currentParams.set("subject", subject);
                      currentParams.set("topic", topic.id);
                      const href = `/${examSlug}?${currentParams.toString()}`;

                      return (
                        <Link
                          key={topic.id}
                          href={href}
                          scroll={false}
                          className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? "bg-[var(--primary-blue)] text-white shadow-sm font-bold"
                              : "text-[var(--text-primary)] hover:bg-[var(--tag-bg)] hover:text-[var(--primary-blue)]"
                          }`}
                        >
                          {topic.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
