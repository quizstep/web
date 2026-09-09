"use client";

import React, { useState } from "react";
import { examService } from "@/lib/services/examService";
import type { PdfMaterial } from "@/types/exam";

interface AdminPdfListProps {
  materials: PdfMaterial[];
  onMaterialDeleted: (id: string) => void;
}

export function AdminPdfList({ materials, onMaterialDeleted }: AdminPdfListProps) {
  const [filterExam, setFilterExam] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredMaterials = materials.filter((item) => {
    const matchesExam = filterExam === "all" || item.examSlug.toLowerCase() === filterExam.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chapterName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesExam && matchesSearch;
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      examService.deletePdfMaterial(id);
      onMaterialDeleted(id);
    }
  };

  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
            Manage Published PDFs ({materials.length})
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            View, search, and delete uploaded PDF study materials.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="px-3 py-2 text-xs bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
          >
            <option value="all">All Exams</option>
            <option value="jee">JEE</option>
            <option value="neet">NEET</option>
            <option value="keam">KEAM</option>
            <option value="cuet">CUET</option>
          </select>

          <input
            type="text"
            placeholder="Search PDFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-2 text-xs bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
          />
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)] flex items-center justify-center font-bold text-xl mx-auto">
            📂
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">No PDF Materials Found</h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            No uploaded PDF documents match your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
          {filteredMaterials.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--tag-bg)]/40 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg shrink-0 mt-0.5">
                  📄
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {item.examSlug}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {item.subject}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {item.type === "notes" ? "Notes PDF" : "Question Bank"}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {item.category ? `${item.category} • ` : ""}{item.chapterName} • Uploaded on {item.uploadedAt} {item.fileSize ? `(${item.fileSize})` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {item.fileUrl && item.fileUrl !== "#" && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-bold text-[var(--primary-blue)] border border-[var(--primary-blue)]/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all"
                  >
                    View PDF
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
