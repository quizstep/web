import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register | QuizStep",
  description: "Create an account on QuizStep to access entrance exam study materials.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 py-12">
      <RegisterForm />
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary-blue)] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
