import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In | QuizStep",
  description: "Log in to your QuizStep account to access entrance exam study materials.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 py-12">
      <LoginForm />
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
