"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminUploadForm } from "@/components/admin/AdminUploadForm";
import { AdminPdfList } from "@/components/admin/AdminPdfList";
import { examService } from "@/lib/services/examService";
import type { PdfMaterial } from "@/types/exam";

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "manage">("upload");
  const [materials, setMaterials] = useState<PdfMaterial[]>([]);

  useEffect(() => {
    setMounted(true);
    // Load existing PDF materials
    setMaterials(examService.getPdfMaterials());
  }, []);

  const handleLoginSuccess = (email: string) => {
    setAdminEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminEmail("");
  };

  const handleMaterialUploaded = (_material: PdfMaterial) => {
    setMaterials(examService.getPdfMaterials());
  };

  const handleMaterialDeleted = (_id: string) => {
    setMaterials(examService.getPdfMaterials());
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[var(--surface-color)]/95 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight"
            >
              QuizStep
            </Link>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              ← Return to Site
            </Link>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {!isAuthenticated ? (
          <div className="space-y-6">
            <AdminLoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Admin Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                  QuizStep Admin Control Panel
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Signed in as <span className="font-bold text-[var(--text-primary)]">{adminEmail}</span>
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 bg-[var(--tag-bg)] p-1 rounded-xl border border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "upload"
                      ? "bg-[var(--surface-color)] text-[var(--primary-blue)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  📤 Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("manage")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "manage"
                      ? "bg-[var(--surface-color)] text-[var(--primary-blue)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  📋 Published PDFs ({materials.length})
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            {activeTab === "upload" ? (
              <AdminUploadForm onMaterialUploaded={handleMaterialUploaded} />
            ) : (
              <AdminPdfList materials={materials} onMaterialDeleted={handleMaterialDeleted} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
