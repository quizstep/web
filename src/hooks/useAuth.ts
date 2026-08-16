"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/services/authService";
import type { AuthUser } from "@/types/auth";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSession() {
      try {
        const { session: initialSession, user: initialUser } = await authService.getSession();
        if (isMounted) {
          setSession(initialSession);
          setUser(initialUser);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialSession();

    // Subscribe to auth state updates
    const unsubscribe = authService.onAuthStateChange((updatedUser, updatedSession) => {
      if (isMounted) {
        setUser(updatedUser);
        setSession(updatedSession);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
