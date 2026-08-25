import { getBrowserClient } from "@/lib/supabase/client";
import { isValidEmail, isCommonPassword } from "@/lib/utils/validation";
import { deviceSessionService } from "@/lib/services/deviceSessionService";
import type { AuthResponse, AuthUser, LoginCredentials, RegisterCredentials } from "@/types/auth";
import type { Session } from "@supabase/supabase-js";

/**
 * Vendor-agnostic Authentication Service
 * Decouples React UI from direct Supabase API calls.
 */
class AuthService {
  private getClient() {
    return getBrowserClient();
  }

  /**
   * Log in using Email and Password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse<{ session: Session; user: AuthUser }>> {
    const { email, password } = credentials;
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      return { success: false, error: "Please enter your email address." };
    }

    if (!isValidEmail(cleanEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    if (!password) {
      return { success: false, error: "Please enter your password." };
    }

    const supabase = this.getClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { success: false, error: this.formatAuthError(error.message) };
      }

      if (data?.session && data?.user) {
        return {
          success: true,
          data: {
            session: data.session,
            user: this.mapSupabaseUser(data.user),
          },
        };
      }

      return { success: false, error: "Invalid login credentials." };
    } catch (err) {
      console.error("Login service exception:", err);
      return { success: false, error: "An unexpected error occurred during login. Please try again." };
    }
  }

  /**
   * Register a new user with duplicate email detection
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse<{ user: AuthUser }>> {
    const { fullName, email, password, confirmPassword } = credentials;
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: "Please enter your full name (at least 2 characters)." };
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    if (!password || password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    if (isCommonPassword(password)) {
      return {
        success: false,
        error: "This password is too common and easily guessed. Please choose a stronger password.",
      };
    }

    if (confirmPassword && password !== confirmPassword) {
      return { success: false, error: "Passwords do not match." };
    }

    const supabase = this.getClient();

    try {
      const metadata: Record<string, string> = {
        full_name: cleanName,
      };

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: metadata,
        },
      });

      // Duplicate email detection in Supabase v2
      const isAlreadyRegistered =
        (error &&
          (error.message.toLowerCase().includes("already registered") ||
            error.message.toLowerCase().includes("already in use") ||
            error.message.toLowerCase().includes("already exists") ||
            error.status === 422 ||
            error.status === 400)) ||
        (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);

      if (isAlreadyRegistered) {
        return {
          success: false,
          error: "An account with this email address already exists. Please log in instead.",
        };
      }

      if (error) {
        return { success: false, error: this.formatAuthError(error.message) };
      }

      if (data?.user) {
        const requiresEmailConfirmation = !data.session;
        return {
          success: true,
          requiresEmailConfirmation,
          data: {
            user: this.mapSupabaseUser(data.user),
          },
        };
      }

      return { success: false, error: "Registration failed. Please try again." };
    } catch (err) {
      console.error("Register service exception:", err);
      return { success: false, error: "An unexpected error occurred during registration. Please try again." };
    }
  }

  /**
   * Log out active session
   *
   * Revokes the current QuizStep device session before
   * signing out of Supabase Auth. The device_id in
   * localStorage is intentionally preserved.
   */
  async logout(): Promise<AuthResponse> {
    try {
      const supabase = this.getClient();

      // Revoke QuizStep device session first (best-effort).
      // If this fails, we still sign out to avoid trapping the user.
      try {
        await deviceSessionService.revokeCurrentDeviceSession();
      } catch (err) {
        console.warn("Device session revocation failed during logout:", err);
      }

      await supabase.auth.signOut();
      return { success: true };
    } catch (err) {
      console.error("Logout exception:", err);
      return { success: false, error: "Failed to log out." };
    }
  }

  /**
   * Get active session
   */
  async getSession(): Promise<{ session: Session | null; user: AuthUser | null }> {
    try {
      const supabase = this.getClient();
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const userId = data.session.user.id;

        // If this device was explicitly revoked, sign out
        const isRevoked = await deviceSessionService.isCurrentDeviceRevoked(userId);
        if (isRevoked) {
          console.warn("Device session was revoked. Signing out.");
          await supabase.auth.signOut();
          return { session: null, user: null };
        }

        // Ensure this device has an active session row.
        // Catches the case where a device authenticated via Supabase
        // but never completed registration (e.g. DeviceLimitScreen tab
        // was closed before resolving).
        const hasSession = await deviceSessionService.hasActiveDeviceSession(userId);
        if (!hasSession) {
          try {
            const result = await deviceSessionService.registerCurrentDevice();
            if (!result.allowed) {
              console.warn("Device limit reached on session restore. Signing out.");
              await supabase.auth.signOut();
              return { session: null, user: null };
            }
          } catch (err) {
            // Registration RPC failed — don't sign out to avoid
            // punishing transient errors.  Periodic checks will
            // catch genuine revocations.
            console.warn("Device session check during restore failed:", err);
          }
        }

        return {
          session: data.session,
          user: this.mapSupabaseUser(data.session.user),
        };
      }
      return { session: null, user: null };
    } catch (err) {
      console.warn("Get session warning:", err);
      return { session: null, user: null };
    }
  }

  /**
   * Subscribe to auth changes
   */
  onAuthStateChange(callback: (user: AuthUser | null, session: Session | null) => void) {
    const supabase = this.getClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback(this.mapSupabaseUser(session.user), session);
      } else {
        callback(null, null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  private mapSupabaseUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }): AuthUser {
    const meta = user.user_metadata || {};
    return {
      id: user.id,
      email: user.email || "",
      fullName: (meta.full_name as string) || (user.email ? user.email.split("@")[0] : "Student"),
      role: (meta.role as "student" | "admin") || "student",
      createdAt: user.created_at,
    };
  }

  private formatAuthError(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes("invalid login credentials") || lower.includes("invalid grant")) {
      return "Invalid email or password. Please check your credentials.";
    }
    if (lower.includes("email not confirmed")) {
      return "Please confirm your email address before logging in.";
    }
    return message;
  }
}

export const authService = new AuthService();
