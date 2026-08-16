import { getBrowserClient } from "@/lib/supabase/client";
import { isValidEmail, validatePhoneNumber, isCommonPassword } from "@/lib/utils/validation";
import type { AuthResponse, AuthUser, LoginCredentials, RegisterCredentials, PhoneValidationResult } from "@/types/auth";
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
   * Log in using Email OR 10-digit Mobile Number
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse<{ session: Session; user: AuthUser }>> {
    const { identifier, password } = credentials;
    const cleanId = identifier.trim();

    if (!cleanId) {
      return { success: false, error: "Please enter your email or phone number." };
    }

    if (!password) {
      return { success: false, error: "Please enter your password." };
    }

    const supabase = this.getClient();
    const isEmail = cleanId.includes("@");

    try {
      if (isEmail) {
        if (!isValidEmail(cleanId)) {
          return { success: false, error: "Please enter a valid email address." };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
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
      } else {
        // Mobile number login
        const phoneCheck = validatePhoneNumber(cleanId);
        if (!phoneCheck.isValid || !phoneCheck.cleanDigits) {
          return { success: false, error: "Please enter a valid email or 10-digit mobile number." };
        }

        const cleanDigits = phoneCheck.cleanDigits;

        // Attempt 1: Direct Phone Auth (+91 format)
        const attempt1 = await supabase.auth.signInWithPassword({
          phone: "+91" + cleanDigits,
          password,
        });

        if (!attempt1.error && attempt1.data?.session && attempt1.data?.user) {
          return {
            success: true,
            data: {
              session: attempt1.data.session,
              user: this.mapSupabaseUser(attempt1.data.user),
            },
          };
        }

        // Attempt 2: Direct Phone Auth (raw 10-digit format)
        const attempt2 = await supabase.auth.signInWithPassword({
          phone: cleanDigits,
          password,
        });

        if (!attempt2.error && attempt2.data?.session && attempt2.data?.user) {
          return {
            success: true,
            data: {
              session: attempt2.data.session,
              user: this.mapSupabaseUser(attempt2.data.user),
            },
          };
        }

        // Attempt 3: Look up user email by phone helper RPC
        try {
          const { data: lookedUpEmail } = await supabase.rpc("get_email_by_phone", {
            phone_input: cleanDigits,
          });

          if (lookedUpEmail) {
            const emailAttempt = await supabase.auth.signInWithPassword({
              email: lookedUpEmail,
              password,
            });

            if (!emailAttempt.error && emailAttempt.data?.session && emailAttempt.data?.user) {
              return {
                success: true,
                data: {
                  session: emailAttempt.data.session,
                  user: this.mapSupabaseUser(emailAttempt.data.user),
                },
              };
            }
          }
        } catch {
          // Ignore RPC lookup failure and fall through
        }

        return {
          success: false,
          error: "Invalid email/phone or password. Please check your credentials.",
        };
      }

      return { success: false, error: "Invalid login credentials." };
    } catch (err) {
      console.error("Login service exception:", err);
      return { success: false, error: "An unexpected error occurred during login. Please try again." };
    }
  }

  /**
   * Register a new user with duplicate email detection & 10-digit phone validation
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse<{ user: AuthUser }>> {
    const { fullName, email, phone, password, confirmPassword } = credentials;
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: "Please enter your full name (at least 2 characters)." };
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    let phoneCheck: PhoneValidationResult = { isValid: true, cleanDigits: "", formatted: "" };
    if (phone && phone.trim()) {
      phoneCheck = validatePhoneNumber(phone);
      if (!phoneCheck.isValid) {
        return { success: false, error: phoneCheck.message || "Please enter a valid 10-digit mobile number." };
      }
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

      if (phoneCheck.cleanDigits) {
        metadata.phone = phoneCheck.cleanDigits;
        metadata.formatted_phone = phoneCheck.formatted;
      }

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
   */
  async logout(): Promise<AuthResponse> {
    try {
      const supabase = this.getClient();
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
      phone: (meta.phone as string) || undefined,
      role: (meta.role as "student" | "admin") || "student",
      createdAt: user.created_at,
    };
  }

  private formatAuthError(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes("invalid login credentials") || lower.includes("invalid grant")) {
      return "Invalid email/phone or password. Please check your credentials.";
    }
    if (lower.includes("email not confirmed")) {
      return "Please confirm your email address before logging in.";
    }
    return message;
  }
}

export const authService = new AuthService();
