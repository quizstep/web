"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { authService } from "@/lib/services/authService";
import { deviceSessionService } from "@/lib/services/deviceSessionService";
import type { AuthUser } from "@/types/auth";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const userRef = useRef<AuthUser | null>(null);
  userRef.current = user;

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
  }, []);

  // Handle session revocation (e.g. revoked by another device)
  const handleRevoked = useCallback(async () => {
    setUser(null);
    setSession(null);
    try {
      await authService.logout();
    } catch {
      // Best effort
    }
  }, []);

  // Check if this device was explicitly revoked
  const checkRevocation = useCallback(async () => {
    if (!userRef.current) return;

    try {
      const isRevoked = await deviceSessionService.isCurrentDeviceRevoked(userRef.current.id);
      if (isRevoked) {
        await handleRevoked();
      }
    } catch {
      // Ignored
    }
  }, [handleRevoked]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSession() {
      try {
        const { session: initialSession, user: initialUser } = await authService.getSession();
        if (isMounted) {
          setSession(initialSession);
          setUser(initialUser);
          setIsLoading(false);
          if (initialUser) {
            deviceSessionService.touchDeviceSession().catch(() => {});
          }
        }
      } catch {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialSession();

    // Subscribe to auth state updates.
    // Verifies that the device actually has an active registered session
    // before marking the user as authenticated (prevents showing UserMenu
    // while the DeviceLimitScreen is active).
    const unsubscribeAuth = authService.onAuthStateChange(async (updatedUser, updatedSession) => {
      if (!isMounted) return;

      if (updatedUser && updatedSession) {
        try {
          const hasSession = await deviceSessionService.hasActiveDeviceSession(updatedUser.id);
          if (!isMounted) return;

          if (hasSession) {
            setUser(updatedUser);
            setSession(updatedSession);
          } else {
            setUser(null);
            setSession(null);
          }
        } catch {
          if (!isMounted) return;
          setUser(null);
          setSession(null);
        }
        setIsLoading(false);
      } else {
        setUser(null);
        setSession(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, [handleRevoked]);

  // Realtime subscription + window focus & periodic heartbeat check + cross-tab sync
  useEffect(() => {
    if (!user) return;

    let isChecking = false;
    const safeCheckRevocation = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        await checkRevocation();
      } finally {
        isChecking = false;
      }
    };

    // 1. Realtime revocation listener (instant kick-out)
    const unsubscribeRealtime = deviceSessionService.subscribeToRevocation(user.id, () => {
      handleRevoked();
    });

    // 2. Window focus & visibility change listener (checks immediately on tab switch)
    const onFocus = () => {
      safeCheckRevocation();
      deviceSessionService.touchDeviceSession().catch(() => {});
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        safeCheckRevocation();
        deviceSessionService.touchDeviceSession().catch(() => {});
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 3. Cross-tab synchronization (BroadcastChannel + storage event)
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        broadcastChannel = new BroadcastChannel("quizstep_session_channel");
        broadcastChannel.onmessage = (event) => {
          if (event.data?.type === "SESSION_REVOKED") {
            handleRevoked();
          }
        };
      }
    } catch {
      // BroadcastChannel unsupported
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === "quizstep_session_revoked_at") {
        handleRevoked();
      }
    };
    window.addEventListener("storage", onStorage);

    // 4. Periodic heartbeat check (every 6 seconds for fast detection across all browsers)
    const intervalId = setInterval(() => {
      safeCheckRevocation();
    }, 6000);

    return () => {
      unsubscribeRealtime();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("storage", onStorage);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      clearInterval(intervalId);
    };
  }, [user, handleRevoked, checkRevocation]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
