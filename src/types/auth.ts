/**
 * Authentication domain types for QuizStep
 */

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'student' | 'admin';
  createdAt?: string;
}

export interface UserSession {
  user: AuthUser | null;
  accessToken?: string;
  expiresAt?: number;
}

export interface LoginCredentials {
  identifier: string; // email or 10-digit mobile number
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
}

export interface PasswordEvaluation {
  score: number;
  label: string;
  className: string;
  hint: string;
  isAcceptable: boolean;
}

export interface PhoneValidationResult {
  isValid: boolean;
  cleanDigits: string;
  formatted: string;
  message?: string;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  requiresEmailConfirmation?: boolean;
}
