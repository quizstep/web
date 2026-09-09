"use client";

import React, { useState, useMemo } from "react";
import { examService } from "@/lib/services/examService";
import type { PdfMaterial } from "@/types/exam";

interface AdminUploadFormProps {
  onMaterialUploaded: (material: PdfMaterial) => void;
}

export function AdminUploadForm({ onMaterialUploaded }: AdminUploadFormProps) {
  const exams = examService.getAllExams();

  const [selectedExamSlug, setSelectedExamSlug] = useState<string>(exams[0]?.slug || "neet");
  const selectedExam = useMemo(() => {
    return examService.getExamBySlug(selectedExamSlug) || exams[0];
  }, [selectedExamSlug, exams]);

  const [selectedSubject, setSelectedSubject] = useState(selectedExam.subjects[0] || "Biology");

  // Filter topics for the selected subject
  const availableTopics = useMemo(() => {
    return examService.getTopicsBySubject(selectedSubject);
  }, [selectedSubject]);

  const categories = useMemo(() => {
    return Array.from(new Set(availableTopics.map((t) => t.category || "General Topics")));
  }, [availableTopics]);

  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");
  const filteredCategoryTopics = useMemo(() => {
    if (!selectedCategory) return availableTopics;
    return availableTopics.filter((t) => (t.category || "General Topics") === selectedCategory);
  }, [availableTopics, selectedCategory]);

  const [selectedChapterId, setSelectedChapterId] = useState(filteredCategoryTopics[0]?.id || "");
  const selectedChapter = useMemo(() => {
    return availableTopics.find((t) => t.id === selectedChapterId) || filteredCategoryTopics[0] || availableTopics[0];
  }, [availableTopics, filteredCategoryTopics, selectedChapterId]);

  const [pdfType, setPdfType] = useState<'notes' | 'question_bank'>("notes");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Update subject when exam changes
  const handleExamChange = (slug: string) => {
    setSelectedExamSlug(slug);
    const exam = examService.getExamBySlug(slug);
    if (exam && exam.subjects.length > 0) {
      setSelectedSubject(exam.subjects[0]);
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
      // Auto-fill title from filename
      setTitle(selected.name.replace(/\.pdf$/i, "").replace(/_/g, " "));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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

      const published = examService.addPdfMaterial({
        title: title.trim(),
        examSlug: selectedExamSlug,
        subject: selectedSubject,
        category: selectedCategory || selectedChapter?.category,
        chapterId: selectedChapter?.id || "ch-1",
        chapterName: selectedChapter?.name || "Chapter Module",
        type: pdfType,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });

      onMaterialUploaded(published);
      setSuccess(`Successfully published "${published.title}" as PDF!`);
      setTitle("");
      setFile(null);
    }, 500);
  };

  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="pb-4 border-b border-[var(--border-color)]">
        <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
          Upload PDF Material
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Cascading Selection: Exam → Subject → Category → Chapter Module (PDF Files Only).
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1 & 2: Select Exam & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              1. Select Exam
            </label>
            <select
              value={selectedExamSlug}
              onChange={(e) => handleExamChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] transition-all"
            >
              {exams.map((ex) => (
                <option key={ex.slug} value={ex.slug}>
                  {ex.name} ({ex.fullName})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              2. Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] transition-all"
            >
              {selectedExam.subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3 & 4: Select Class Category & Chapter Module */}
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
          {submitting ? "Publishing PDF..." : "Publish PDF to Chapter"}
        </button>
      </form>
    </div>
  );
}
