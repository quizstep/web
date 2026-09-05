"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface CourseMenuSidebarProps {
  examSlug: string;
}

export function CourseMenuSidebar({ examSlug }: CourseMenuSidebarProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "notes";
  const currentSubject = searchParams.get("subject");
  const currentTopic = searchParams.get("topic");

  const buildHref = (tabId: string) => {
    const params = new URLSearchParams();
    if (currentSubject) params.set("subject", currentSubject);
    if (currentTopic) params.set("topic", currentTopic);
    params.set("tab", tabId);
    return `/${examSlug}?${params.toString()}`;
  };

  const menuItems = [
    {
      id: "notes",
      label: "Notes",
      description: "Detailed study material",
      href: buildHref("notes"),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "short-notes",
      label: "Short Notes",
      description: "Quick revision notes",
      href: buildHref("short-notes"),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: "doubts",
      label: "Doubt Clearance",
      description: "Ask & clear topic doubts",
      href: buildHref("doubts"),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "materials",
      label: "Question Banks",
      description: "Available exam materials",
      href: buildHref("materials"),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3 p-4 sm:p-5 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-sm h-fit">
      <div className="px-1">
        <span className="text-xs font-bold text-[var(--primary-blue)] uppercase tracking-wider">
          Topic Dashboard
        </span>
        <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
          Course Menu
        </h3>
      </div>

      <nav className="flex flex-col space-y-1.5">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id || (!currentTab && item.id === "notes");

          return (
            <Link
              key={item.id}
              href={item.href}
              scroll={false}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "bg-[var(--primary-blue)] text-white shadow-sm font-semibold"
                  : "text-[var(--text-secondary)] hover:bg-[var(--tag-bg)] hover:text-[var(--primary-blue)]"
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-medium leading-tight">{item.label}</span>
                <span
                  className={`text-[10px] leading-tight ${
                    isActive ? "text-blue-100" : "text-[var(--text-secondary)] opacity-80"
                  }`}
                >
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
