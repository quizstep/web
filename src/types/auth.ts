/**
 * Authentication domain types for QuizStep
 */

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'admin';
  createdAt?: string;
}

export interface UserSession {
  user: AuthUser | null;
  accessToken?: string;
  expiresAt?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
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

export interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  requiresEmailConfirmation?: boolean;
}
