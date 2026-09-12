"use client";

import React, { useState, useMemo, useEffect } from "react";
import { examService } from "@/lib/services/examService";
import type { PdfMaterial } from "@/types/exam";

interface AdminUploadFormProps {
  onMaterialUploaded: (materials: PdfMaterial[]) => void;
  initialSelection?: {
    examSlug?: string;
    subject?: string;
    category?: string;
    chapterId?: string;
  } | null;
}

export function AdminUploadForm({ onMaterialUploaded, initialSelection }: AdminUploadFormProps) {
  const exams = examService.getAllExams();

  // Multi-exam selection state
  const [selectedExamSlugs, setSelectedExamSlugs] = useState<string[]>([exams[0]?.slug || "jee"]);

  // Derive primary exam for primary subject dropdown context
  const primaryExamSlug = selectedExamSlugs[0] || exams[0]?.slug || "jee";
  const primaryExam = useMemo(() => {
    return examService.getExamBySlug(primaryExamSlug) || exams[0];
  }, [primaryExamSlug, exams]);

  // Subject state
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // Sync selected subject when primary exam changes if current subject not available
  useEffect(() => {
    if (primaryExam && primaryExam.subjects.length > 0) {
      const isSubjectValid = primaryExam.subjects.some(
        (s) => s.toLowerCase() === selectedSubject.toLowerCase()
      );
      if (!isSubjectValid) {
        setSelectedSubject(primaryExam.subjects[0]);
      }
    }
  }, [primaryExam, selectedSubject]);

  const [topicsVersion, setTopicsVersion] = useState(0);

  // Filter topics for the selected subject and exam
  const availableTopics = useMemo(() => {
    if (!selectedSubject) return [];
    return examService.getTopicsBySubject(selectedSubject, primaryExamSlug);
  }, [selectedSubject, primaryExamSlug, topicsVersion]);

  // Derive unique categories
  const categories = useMemo(() => {
    if (availableTopics.length === 0) return [];
    return Array.from(new Set(availableTopics.map((t) => t.category || "General Topics")));
  }, [availableTopics]);

  // Category state
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Auto-sync selected category whenever categories change
  useEffect(() => {
    if (categories.length > 0) {
      if (!categories.includes(selectedCategory)) {
        setSelectedCategory(categories[0]);
      }
    } else {
      setSelectedCategory("");
    }
  }, [categories, selectedCategory]);

  // Filtered topics by category
  const filteredCategoryTopics = useMemo(() => {
    if (!selectedCategory) return availableTopics;
    return availableTopics.filter((t) => (t.category || "General Topics") === selectedCategory);
  }, [availableTopics, selectedCategory]);

  // Chapter module state
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  // Auto-sync selected chapter whenever filteredCategoryTopics change
  useEffect(() => {
    if (filteredCategoryTopics.length > 0) {
      if (!filteredCategoryTopics.some((t) => t.id === selectedChapterId)) {
        setSelectedChapterId(filteredCategoryTopics[0].id);
      }
    } else {
      setSelectedChapterId("");
    }
  }, [filteredCategoryTopics, selectedChapterId]);

  // Auto-sync initialSelection when passed from Manage tab (+ Add PDF button)
  useEffect(() => {
    if (initialSelection) {
      if (initialSelection.examSlug) {
        setSelectedExamSlugs([initialSelection.examSlug]);
      }
      if (initialSelection.subject) {
        setSelectedSubject(initialSelection.subject);
      }
      if (initialSelection.category) {
        setSelectedCategory(initialSelection.category);
      }
      if (initialSelection.chapterId) {
        setSelectedChapterId(initialSelection.chapterId);
      }
    }
  }, [initialSelection]);

  const selectedChapter = useMemo(() => {
    return availableTopics.find((t) => t.id === selectedChapterId) || filteredCategoryTopics[0] || availableTopics[0];
  }, [availableTopics, filteredCategoryTopics, selectedChapterId]);

  const [pdfType, setPdfType] = useState<'notes' | 'question_bank'>("notes");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);



  // Multi-exam selection toggle
  const toggleExamSlug = (slug: string) => {
    setSelectedExamSlugs((prev) => {
      let nextSlugs: string[];
      if (prev.includes(slug)) {
        nextSlugs = prev.filter((s) => s !== slug);
      } else {
        nextSlugs = [slug, ...prev];
      }

      if (nextSlugs.length > 0) {
        const newPrimary = examService.getExamBySlug(nextSlugs[0]) || exams[0];
        if (newPrimary && newPrimary.subjects.length > 0) {
          const isSubjectValid = newPrimary.subjects.some(
            (s) => s.toLowerCase() === selectedSubject.toLowerCase()
          );
          if (!isSubjectValid) {
            setSelectedSubject(newPrimary.subjects[0]);
          }
        }
      }

      return nextSlugs;
    });
  };

  const toggleSelectAllExams = () => {
    if (selectedExamSlugs.length === exams.length) {
      setSelectedExamSlugs([]);
    } else {
      setSelectedExamSlugs(exams.map((e) => e.slug));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".pdf")) {
      setError("Invalid file format. Only .pdf files are allowed for upload.");
      setFile(null);
      return;
    }

    setFile(selected);
    if (!title) {
      setTitle(selected.name.replace(/\.pdf$/i, "").replace(/_/g, " "));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (selectedExamSlugs.length === 0) {
      setError("Please select at least one target exam.");
      return;
    }

    if (!file) {
      setError("Please select a valid PDF file.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for this PDF document.");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);

      const publishedList = examService.addPdfMaterialMulti(
        {
          title: title.trim(),
          examSlug: selectedExamSlugs[0],
          subject: selectedSubject,
          category: selectedCategory || selectedChapter?.category,
          chapterId: selectedChapter?.id || "ch-custom",
          chapterName: selectedChapter?.name || "Chapter Module",
          type: pdfType,
          fileUrl: URL.createObjectURL(file),
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        },
        selectedExamSlugs
      );

      onMaterialUploaded(publishedList);
      setSuccess(`Published "${title.trim()}" to ${selectedExamSlugs.length} exam(s)!`);
      setTitle("");
      setFile(null);
    }, 400);
  };

  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="pb-4 border-b border-[var(--border-color)]">
        <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
          Upload PDF Material
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Select target exams, subject, class category, and chapter module. PDF files only.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Multi-Exam Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              1. Target Exams (Multi-Select)
            </label>
            <button
              type="button"
              onClick={toggleSelectAllExams}
              className="text-[11px] font-bold text-[var(--primary-blue)] hover:underline"
            >
              {selectedExamSlugs.length === exams.length ? "Deselect All" : "Select All Exams"}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {exams.map((ex) => {
              const isChecked = selectedExamSlugs.includes(ex.slug);
              return (
                <button
                  key={ex.slug}
                  type="button"
                  onClick={() => toggleExamSlug(ex.slug)}
                  className={`p-3 text-left rounded-xl border transition-all flex items-center justify-between ${
                    isChecked
                      ? "bg-blue-50 border-[var(--primary-blue)] text-[var(--primary-blue)] dark:bg-blue-950/40"
                      : "bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-gray-400"
                  }`}
                >
                  <div className="font-extrabold text-xs sm:text-sm">{ex.name}</div>
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${
                      isChecked
                        ? "bg-[var(--primary-blue)] text-white"
                        : "border border-[var(--border-color)]"
                    }`}
                  >
                    {isChecked ? "✓" : ""}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedExamSlugs.length === 0 && (
            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 pt-1">
              ⚠️ No target exam selected. Select at least one exam to publish material.
            </p>
          )}
        </div>

        {/* Step 2: Select Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            2. Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] transition-all"
          >
            {primaryExam.subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3 & 4: Category & Chapter Module */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              3. Class / Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] transition-all"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              4. Chapter / Module
            </label>

            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] transition-all"
            >
              {filteredCategoryTopics.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Material Type & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Material Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPdfType("notes")}
                className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                  pdfType === "notes"
                    ? "bg-[var(--primary-blue)] text-white border-[var(--primary-blue)] shadow-sm"
                    : "bg-[var(--surface-color)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--tag-bg)]"
                }`}
              >
                📖 Notes PDF
              </button>
              <button
                type="button"
                onClick={() => setPdfType("question_bank")}
                className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                  pdfType === "question_bank"
                    ? "bg-[var(--primary-blue)] text-white border-[var(--primary-blue)] shadow-sm"
                    : "bg-[var(--surface-color)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--tag-bg)]"
                }`}
              >
                📑 Question Bank PDF
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              PDF Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Biological Classification Notes Vol 1"
              required
              suppressHydrationWarning
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] transition-all"
            />
          </div>
        </div>

        {/* PDF File Picker strictly .pdf */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Upload PDF File (.pdf strictly)
          </label>
          <div className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-5 text-center hover:border-blue-500 transition-colors bg-[var(--tag-bg)]/40">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              id="admin-pdf-upload"
              suppressHydrationWarning
              className="hidden"
            />
            <label htmlFor="admin-pdf-upload" className="cursor-pointer space-y-2 block">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--primary-blue)] flex items-center justify-center font-bold text-lg mx-auto">
                📄
              </div>
              <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                {file ? file.name : "Click to select a PDF file"}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for upload` : "Supports PDF documents up to 50MB"}
              </p>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !file}
          className="w-full py-3 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md hover:shadow-lg disabled:opacity-40 transition-all active:scale-95"
        >
          {submitting
            ? "Publishing PDF..."
            : `Publish PDF to ${selectedExamSlugs.length} Exam(s)`}
        </button>
      </form>
    </div>
  );
}

