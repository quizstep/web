"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { authService } from "@/lib/services/authService";
import { evaluatePasswordStrength } from "@/lib/utils/validation";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "error" | "success" | "info" } | null>(null);

  const passwordEvaluation = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    setIsLoading(true);

    try {
      const response = await authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        confirmPassword,
      });

      if (!response.success) {
        setAlert({ message: response.error || "Registration failed.", type: "error" });
        setIsLoading(false);
        return;
      }

      if (response.requiresEmailConfirmation) {
        setAlert({
          message: "Registration successful! Please check your email to confirm your account before logging in.",
          type: "success",
        });
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setIsLoading(false);
      } else {
        setAlert({ message: "Account created successfully! Redirecting...", type: "success" });
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      }
    } catch {
      setAlert({ message: "An unexpected error occurred. Please try again.", type: "error" });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl shadow-card transition-colors duration-200">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Create Account</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Sign up for QuizStep</p>
      </div>

      {/* Alert Banner */}
      {alert && <Alert type={alert.type} message={alert.message} className="mb-5" />}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Full name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Phone"
          optional
          type="tel"
          name="phone"
          placeholder="10-digit mobile"
          autoComplete="tel"
          maxLength={15}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="space-y-1">
          <PasswordInput
            label="Password"
            name="password"
            placeholder="Min 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordStrengthMeter evaluation={passwordEvaluation} show={password.length > 0} />
        </div>

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          loadingText="Creating Account..."
          className="w-full py-2.5 text-base font-semibold mt-2"
          id="submit-btn"
        >
          Create Account
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center mt-6 pt-5 border-t border-[var(--border-color)] text-sm text-[var(--text-secondary)]">
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--primary-blue)] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
