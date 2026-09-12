"use client";

import React, { useState, useMemo } from "react";
import { examService } from "@/lib/services/examService";
import type { ChapterTopic, PdfMaterial } from "@/types/exam";

interface AdminCurriculumManagerProps {
  onCurriculumChanged?: () => void;
  onNavigateToUpload?: (prefill: {
    examSlug: string;
    subject: string;
    category?: string;
    chapterId?: string;
  }) => void;
}

export function AdminCurriculumManager({
  onCurriculumChanged,
  onNavigateToUpload,
}: AdminCurriculumManagerProps) {
  const exams = examService.getAllExams();

  const [selectedExamSlug, setSelectedExamSlug] = useState<string>(exams[0]?.slug || "jee");
  const selectedExam = useMemo(() => {
    return examService.getExamBySlug(selectedExamSlug) || exams[0];
  }, [selectedExamSlug, exams]);

  const [selectedSubject, setSelectedSubject] = useState<string>(selectedExam.subjects[0] || "Physics");
  const [version, setVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync subject when exam changes
  const handleExamSelect = (slug: string) => {
    setSelectedExamSlug(slug);
    const ex = examService.getExamBySlug(slug);
    if (ex && ex.subjects.length > 0) {
      const isValid = ex.subjects.some(
        (s) => s.toLowerCase() === selectedSubject.toLowerCase()
      );
      if (!isValid) {
        setSelectedSubject(ex.subjects[0]);
      }
    }
  };

  // Fetch all topics for current exam & subject
  const topics: ChapterTopic[] = useMemo(() => {
    return examService.getTopicsBySubject(selectedSubject, selectedExamSlug);
  }, [selectedSubject, selectedExamSlug, version]);

  // Fetch all published PDF materials for real-time counters and expanded drawer
  const allPdfMaterials: PdfMaterial[] = useMemo(() => {
    return examService.getPdfMaterials();
  }, [version]);

  // Filter topics by search query
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase().trim();
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q))
    );
  }, [topics, searchQuery]);

  // Group filtered topics by category
  const categoriesMap = useMemo(() => {
    const map: Record<string, ChapterTopic[]> = {};
    filteredTopics.forEach((t) => {
      const cat = t.category || "General Topics";
      if (!map[cat]) map[cat] = [];
      map[cat].push(t);
    });
    return map;
  }, [filteredTopics]);

  // Compute exams containing the selected subject
  const examsContainingSubject = useMemo(() => {
    return exams.filter((e) =>
      e.subjects.some((s) => s.toLowerCase() === selectedSubject.toLowerCase())
    );
  }, [exams, selectedSubject]);

  // Modal & Card Expansion States
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");
  const [selectedChapterExamSlugs, setSelectedChapterExamSlugs] = useState<string[]>([]);
  const [biologyBranch, setBiologyBranch] = useState<"Botany" | "Zoology">("Botany");
  const [classLevel, setClassLevel] = useState<"Class XI" | "Class XII">("Class XI");

  const [deletingTopic, setDeletingTopic] = useState<{ id: string; name: string } | null>(null);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<{ title: string; url: string } | null>(null);

  // Subtle aesthetic theme variations for adjacent cards
  const cardThemes = [
    {
      bg: "bg-gradient-to-br from-blue-50/50 via-[var(--surface-color)] to-slate-50/60 dark:from-blue-950/20 dark:via-[var(--surface-color)] dark:to-slate-900/50",
      border: "border-blue-200/80 dark:border-blue-900/40",
      accent: "border-l-4 border-l-blue-500",
    },
    {
      bg: "bg-gradient-to-br from-indigo-50/50 via-[var(--surface-color)] to-slate-50/60 dark:from-indigo-950/20 dark:via-[var(--surface-color)] dark:to-slate-900/50",
      border: "border-indigo-200/80 dark:border-indigo-900/40",
      accent: "border-l-4 border-l-indigo-500",
    },
    {
      bg: "bg-gradient-to-br from-purple-50/50 via-[var(--surface-color)] to-slate-50/60 dark:from-purple-950/20 dark:via-[var(--surface-color)] dark:to-slate-900/50",
      border: "border-purple-200/80 dark:border-purple-900/40",
      accent: "border-l-4 border-l-purple-500",
    },
    {
      bg: "bg-gradient-to-br from-cyan-50/50 via-[var(--surface-color)] to-slate-50/60 dark:from-cyan-950/20 dark:via-[var(--surface-color)] dark:to-slate-900/50",
      border: "border-cyan-200/80 dark:border-cyan-900/40",
      accent: "border-l-4 border-l-cyan-500",
    },
  ];

  const handleOpenAddChapter = () => {
    setSelectedChapterExamSlugs(examsContainingSubject.map((e) => e.slug));
    setBiologyBranch("Botany");
    setClassLevel("Class XI");
    setNewChapterName("");
    setShowAddChapter(true);
  };

  const toggleChapterExamSlug = (slug: string) => {
    setSelectedChapterExamSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      return [...prev, slug];
    });
  };

  const toggleSelectAllChapterExams = () => {
    if (selectedChapterExamSlugs.length === examsContainingSubject.length) {
      setSelectedChapterExamSlugs([]);
    } else {
      setSelectedChapterExamSlugs(examsContainingSubject.map((e) => e.slug));
    }
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    examService.addSubjectToExam(selectedExamSlug, newSubjectName.trim());
    setSelectedSubject(newSubjectName.trim());
    setNewSubjectName("");
    setShowAddSubject(false);
    setVersion((v) => v + 1);
    onCurriculumChanged?.();
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim() || !selectedSubject || selectedChapterExamSlugs.length === 0) return;

    const isBio = selectedSubject.toLowerCase() === "biology";
    const cat = isBio
      ? `${classLevel} ${biologyBranch}`
      : `${classLevel} ${selectedSubject}`;

    examService.addTopicToSubject(
      selectedSubject,
      {
        name: newChapterName.trim(),
        category: cat,
      },
      selectedChapterExamSlugs
    );

    setNewChapterName("");
    setShowAddChapter(false);
    setVersion((v) => v + 1);
    onCurriculumChanged?.();
  };

  const confirmDeleteChapter = () => {
    if (!deletingTopic || !selectedSubject) return;

    examService.deleteTopicFromSubject(selectedSubject, deletingTopic.id);
    setDeletingTopic(null);
    setVersion((v) => v + 1);
    onCurriculumChanged?.();
  };

  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
            Curriculum & Chapter Manager
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            View, add, and manage subjects, chapter modules, and attached study materials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddSubject(true)}
            className="px-3.5 py-2 text-xs font-bold text-[var(--primary-blue)] border border-[var(--primary-blue)]/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all"
          >
            + New Subject
          </button>
          <button
            type="button"
            onClick={handleOpenAddChapter}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[var(--primary-blue)] rounded-xl hover:opacity-90 transition-all"
          >
            + New Chapter
          </button>
        </div>
      </div>

      {/* Exam Selection Pills */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Select Exam
        </label>
        <div className="flex flex-wrap gap-2">
          {exams.map((ex) => (
            <button
              key={ex.slug}
              type="button"
              onClick={() => handleExamSelect(ex.slug)}
              className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-xl border transition-all ${
                selectedExamSlug === ex.slug
                  ? "bg-[var(--primary-blue)] text-white border-[var(--primary-blue)] shadow-sm"
                  : "bg-[var(--surface-color)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--tag-bg)]"
              }`}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Selection Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          {selectedExam.name} Subjects
        </label>
        <div className="flex flex-wrap gap-2 border-b border-[var(--border-color)] pb-3">
          {selectedExam.subjects.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                selectedSubject === sub
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--tag-bg)]"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* In-Tab Chapter Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${selectedSubject} chapters by name or category...`}
          className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] transition-all"
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

      {/* Categories & Premium Chapter Cards */}
      <div className="space-y-6">
        {Object.keys(categoriesMap).length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
            {searchQuery
              ? `No chapters found matching "${searchQuery}" in ${selectedSubject}.`
              : `No chapter modules found for ${selectedSubject}. Click "+ New Chapter" to add one.`}
          </div>
        ) : (
          Object.entries(categoriesMap).map(([category, chapList]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--primary-blue)] border-b border-[var(--border-color)]/60 pb-1.5">
                <span>{category} ({chapList.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chapList.map((ch, idx) => {
                  const chapterPdfs = allPdfMaterials.filter(
                    (m) =>
                      m.subject.toLowerCase() === selectedSubject.toLowerCase() &&
                      (m.chapterId === ch.id || m.chapterName.toLowerCase() === ch.name.toLowerCase())
                  );
                  const notesCount = chapterPdfs.filter((m) => m.type === "notes").length;
                  const qbCount = chapterPdfs.filter((m) => m.type === "question_bank").length;
                  const totalPdfs = chapterPdfs.length;
                  const targetExams = ch.examSlugs || (ch.examSlug ? [ch.examSlug] : examsContainingSubject.map((e) => e.slug));
                  const isExpanded = expandedChapterId === ch.id;
                  const theme = cardThemes[idx % cardThemes.length];

                  return (
                    <div
                      key={ch.id}
                      onClick={() => setExpandedChapterId(isExpanded ? null : ch.id)}
                      onMouseLeave={() => {
                        if (isExpanded) {
                          setExpandedChapterId(null);
                        }
                      }}
                      className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 shadow-xs flex flex-col justify-between ${theme.accent} ${
                        isExpanded
                          ? "border-[var(--primary-blue)] ring-2 ring-[var(--primary-blue)]/20 shadow-md bg-blue-50/30 dark:bg-blue-950/30"
                          : `${theme.bg} ${theme.border} hover:border-gray-400 dark:hover:border-gray-500 hover:-translate-y-0.5 hover:shadow-md`
                      }`}
                    >
                      {/* Collapsed Chapter Top Header */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] leading-snug">
                            {ch.name}
                          </h4>
                          {totalPdfs > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                              📄 {notesCount} Notes • 📑 {qbCount} QB
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900 shrink-0">
                              ⚠️ 0 PDFs Attached
                            </span>
                          )}
                        </div>

                        {/* Target Exam Badges */}
                        <div className="flex flex-wrap gap-1">
                          {targetExams.map((slug) => (
                            <span
                              key={slug}
                              className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded-md bg-[var(--tag-bg)] text-[var(--text-secondary)] border border-[var(--border-color)]"
                            >
                              {slug}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Collapsed Card Bottom Controls */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border-color)]/60 mt-3">
                        <span className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                          isExpanded
                            ? "bg-[var(--primary-blue)] text-white shadow-sm"
                            : "bg-blue-50 text-[var(--primary-blue)] dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900"
                        }`}>
                          <span>View Content ({totalPdfs})</span>
                          <span className={`text-[10px] transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                            ▼
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingTopic({ id: ch.id, name: ch.name });
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>

                      {/* Expanded Card Contents Area (Hovering mouse outside closes card) */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--primary-blue)]">
                              Attached Study Content ({totalPdfs})
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)] italic">
                              (Move cursor outside card to close)
                            </span>
                          </div>

                          {totalPdfs === 0 ? (
                            <div className="p-3 bg-[var(--tag-bg)]/60 border border-dashed border-[var(--border-color)] rounded-xl text-center space-y-2">
                              <p className="text-xs text-[var(--text-secondary)]">No materials uploaded for this chapter yet.</p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToUpload?.({
                                    examSlug: selectedExamSlug,
                                    subject: selectedSubject,
                                    category: ch.category,
                                    chapterId: ch.id,
                                  });
                                }}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[var(--primary-blue)] rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-1"
                              >
                                + Add PDF to Chapter
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {chapterPdfs.map((pdf) => (
                                <div
                                  key={pdf.id}
                                  className="p-2.5 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl flex items-center justify-between gap-2 hover:border-gray-400 transition-colors"
                                >
                                  <div className="min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                          pdf.type === "notes"
                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
                                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                                        }`}
                                      >
                                        {pdf.type === "notes" ? "Notes" : "Question Bank"}
                                      </span>
                                      <span className="text-[10px] text-[var(--text-secondary)] font-medium">{pdf.fileSize}</span>
                                    </div>
                                    <div className="font-bold text-xs text-[var(--text-primary)] truncate">{pdf.title}</div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewPdfUrl({ title: pdf.title, url: pdf.fileUrl });
                                      }}
                                      className="px-2 py-0.5 text-[11px] font-bold text-[var(--primary-blue)] border border-[var(--primary-blue)]/30 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                    >
                                      Preview
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        examService.deletePdfMaterial(pdf.id);
                                        setVersion((v) => v + 1);
                                        onCurriculumChanged?.();
                                      }}
                                      className="px-2 py-0.5 text-[11px] font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}

                              <div className="pt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigateToUpload?.({
                                      examSlug: selectedExamSlug,
                                      subject: selectedSubject,
                                      category: ch.category,
                                      chapterId: ch.id,
                                    });
                                  }}
                                  className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition-all inline-flex items-center gap-1"
                                >
                                  + Add PDF to Chapter
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-extrabold text-[var(--text-primary)]">
              Add Subject to {selectedExam.name}
            </h4>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <input
                type="text"
                placeholder="Subject Name (e.g. Botany)"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[var(--primary-blue)] rounded-xl hover:opacity-90"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {showAddChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-extrabold text-[var(--text-primary)]">
              Add Chapter Module to {selectedSubject}
            </h4>
            <form onSubmit={handleAddChapter} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Chapter Name</label>
                <input
                  type="text"
                  placeholder={selectedSubject.toLowerCase() === "biology" ? "e.g. Plant Physiology / Human Reproduction" : "e.g. Wave Optics & Interference"}
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)]"
                />
              </div>

              {/* Biology Branch Selector (Botany vs Zoology) */}
              {selectedSubject.toLowerCase() === "biology" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">
                    Biology Discipline / Branch
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBiologyBranch("Botany")}
                      className={`p-2.5 text-center rounded-xl border text-xs font-bold transition-all ${
                        biologyBranch === "Botany"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm"
                          : "bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--tag-bg)]"
                      }`}
                    >
                      🌿 Botany
                    </button>
                    <button
                      type="button"
                      onClick={() => setBiologyBranch("Zoology")}
                      className={`p-2.5 text-center rounded-xl border text-xs font-bold transition-all ${
                        biologyBranch === "Zoology"
                          ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 shadow-sm"
                          : "bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--tag-bg)]"
                      }`}
                    >
                      🦁 Zoology
                    </button>
                  </div>
                </div>
              )}

              {/* Class Level Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  Class Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClassLevel("Class XI")}
                    className={`p-2 text-center rounded-xl border text-xs font-bold transition-all ${
                      classLevel === "Class XI"
                        ? "bg-blue-50 border-[var(--primary-blue)] text-[var(--primary-blue)] dark:bg-blue-950/40"
                        : "bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--tag-bg)]"
                    }`}
                  >
                    Class XI
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassLevel("Class XII")}
                    className={`p-2 text-center rounded-xl border text-xs font-bold transition-all ${
                      classLevel === "Class XII"
                        ? "bg-blue-50 border-[var(--primary-blue)] text-[var(--primary-blue)] dark:bg-blue-950/40"
                        : "bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--tag-bg)]"
                    }`}
                  >
                    Class XII
                  </button>
                </div>
              </div>

              {/* Category Badge Preview */}
              <div className="px-3 py-2 bg-[var(--tag-bg)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-secondary)] flex justify-between items-center">
                <span>Target Category:</span>
                <span className="font-extrabold text-[var(--primary-blue)]">
                  {selectedSubject.toLowerCase() === "biology"
                    ? `${classLevel} ${biologyBranch}`
                    : `${classLevel} ${selectedSubject}`}
                </span>
              </div>

              {/* Target Exams Checkboxes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">
                    Add to Exams (Default: All offering {selectedSubject})
                  </label>
                  <button
                    type="button"
                    onClick={toggleSelectAllChapterExams}
                    className="text-[11px] font-bold text-[var(--primary-blue)] hover:underline"
                  >
                    {selectedChapterExamSlugs.length === examsContainingSubject.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {examsContainingSubject.map((ex) => {
                    const isChecked = selectedChapterExamSlugs.includes(ex.slug);
                    return (
                      <button
                        key={ex.slug}
                        type="button"
                        onClick={() => toggleChapterExamSlug(ex.slug)}
                        className={`p-2.5 text-left rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                          isChecked
                            ? "bg-blue-50 border-[var(--primary-blue)] text-[var(--primary-blue)] dark:bg-blue-950/40"
                            : "bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)]"
                        }`}
                      >
                        <span>{ex.name}</span>
                        <span>{isChecked ? "✓" : ""}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedChapterExamSlugs.length === 0 && (
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 pt-1">
                    ⚠️ No exam selected. Select at least one exam to create this chapter.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChapter(false)}
                  className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[var(--primary-blue)] rounded-xl hover:opacity-90"
                >
                  Save Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read-Only PDF Preview Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)] bg-[var(--surface-color)]">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <span className="text-sm font-extrabold text-[var(--text-primary)] truncate">
                  📄 {previewPdfUrl.title}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  Read-Only Preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPdfUrl(null)}
                className="px-3 py-1 text-xs font-extrabold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--tag-bg)] rounded-lg transition-colors"
              >
                Close ✕
              </button>
            </div>

            <div className="flex-1 bg-gray-900 relative">
              <iframe
                src={`${previewPdfUrl.url}#toolbar=0&navpanes=0`}
                className="w-full h-full border-0 select-none pointer-events-auto"
                title={previewPdfUrl.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Chapter Confirmation Modal */}
      {deletingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-extrabold text-[var(--text-primary)]">
              Confirm Chapter Deletion
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Are you sure you want to delete chapter &quot;<span className="font-bold text-[var(--text-primary)]">{deletingTopic.name}</span>&quot; from {selectedSubject}?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTopic(null)}
                className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteChapter}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
