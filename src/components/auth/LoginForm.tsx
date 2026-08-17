"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authService } from "@/lib/services/authService";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "error" | "success" | "info" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!email.trim()) {
      setAlert({ message: "Please enter your email address.", type: "error" });
      return;
    }

    if (!password) {
      setAlert({ message: "Please enter your password.", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      if (!response.success) {
        setAlert({ message: response.error || "Invalid login credentials.", type: "error" });
        setIsLoading(false);
        return;
      }

      setAlert({ message: "Login successful! Redirecting...", type: "success" });
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch {
      setAlert({ message: "An unexpected error occurred. Please try again.", type: "error" });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setAlert({
      message: "Password reset is not yet configured for this platform. Please contact support.",
      type: "info",
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl shadow-card transition-colors duration-200">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Welcome Back</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Log in to QuizStep</p>
      </div>

      {/* Alert Banner */}
      {alert && <Alert type={alert.type} message={alert.message} className="mb-5" />}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs font-medium text-[var(--primary-blue)] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          loadingText="Logging in..."
          className="w-full py-2.5 text-base font-semibold"
          id="submit-btn"
        >
          Log In
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center mt-6 pt-5 border-t border-[var(--border-color)] text-sm text-[var(--text-secondary)]">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[var(--primary-blue)] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
