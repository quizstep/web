"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface CourseMenuSidebarProps {
  examSlug: string;
}

export function CourseMenuSidebar({ examSlug }: CourseMenuSidebarProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const menuItems = [
    { id: "materials", label: "Question Banks", href: `/${examSlug}` },
    { id: "lectures", label: "Lectures & Videos", href: `/${examSlug}?tab=lectures` },
    { id: "quizzes", label: "Interactive Quizzes", href: `/${examSlug}?tab=quizzes` },
    { id: "practice", label: "Practice Exercises", href: `/${examSlug}?tab=practice` },
    { id: "resources", label: "Supplementary Resources", href: `/${examSlug}?tab=resources` },
    { id: "forum", label: "Course Discussion Forum", href: `/${examSlug}?tab=forum` },
    { id: "progress", label: "Progress Tracking", href: `/${examSlug}?tab=progress` },
    { id: "enrolled", label: "Enrolled Courses", href: `/dashboard/enrolled` },
    { id: "dashboard", label: "My Learning Dashboard", href: `/dashboard` },
    { id: "recommended", label: "Recommended Courses", href: `/dashboard/recommended` },
    { id: "certificates", label: "View Certificates", href: `/dashboard/certificates` },
  ];

  return (
    <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2 p-4 sm:p-5 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-sm h-fit">
      <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 px-2">
        Course Menu
      </h3>
      <nav className="flex flex-col space-y-1">
        {menuItems.map((item) => {
          // Determine if this item is active
          const isActive = 
            (currentTab === item.id) || 
            (!currentTab && item.id === "materials");

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? "bg-[var(--tag-bg)] text-[var(--primary-blue)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--tag-bg)] hover:text-[var(--primary-blue)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
