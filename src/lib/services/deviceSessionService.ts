import { getBrowserClient } from "@/lib/supabase/client";
import { getDeviceId, getDeviceInfo, getBrowserName } from "@/lib/utils/device";
import type { UserSessionTable } from "@/types/database";

// ============================================
// Types
// ============================================

export interface DeviceSessionResult {
  success: boolean;
  allowed: boolean;
  reason: string;
  session_id?: number;
  active_devices?: number;
}

export interface ActiveDevice {
  id: number;
  device_name: string | null;
  device_type: UserSessionTable["device_type"];
  browser_name: string | null;
  created_at: string;
  last_active_at: string;
  is_current: boolean;
}

// ============================================
// Device Session Service
// ============================================

class DeviceSessionService {
  private getClient() {
    return getBrowserClient();
  }

  /**
   * Register the current browser as a device session.
   *
   * Calls the `register_device_session` database function
   * which enforces the 2-device limit with advisory locking.
   */
  async registerCurrentDevice(): Promise<DeviceSessionResult> {
    const supabase = this.getClient();
    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();
    const browserName = getBrowserName();

    const { data, error } = await supabase.rpc("register_device_session", {
      p_device_id: deviceId,
      p_device_name: deviceInfo.name,
      p_device_type: deviceInfo.type,
      p_browser_name: browserName,
    });

    if (error) {
      console.error("Device session registration failed:", error.message);
      return {
        success: false,
        allowed: false,
        reason: "rpc_error",
      };
    }

    // The function returns a JSON object.
    const result = data as DeviceSessionResult;

    return result;
  }

  /**
   * Fetch the current user's active device sessions.
   *
   * Active = revoked_at IS NULL AND expires_at > now().
   * Results are compared against the current device ID to
   * mark which session belongs to this browser.
   */
  async getActiveDevices(): Promise<ActiveDevice[]> {
    const supabase = this.getClient();

    const { data, error } = await supabase
      .from("user_sessions")
      .select("id, device_id, device_name, device_type, browser_name, created_at, last_active_at, expires_at, revoked_at")
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("last_active_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch active devices:", error.message);
      return [];
    }

    if (!data) {
      return [];
    }

    let currentDeviceId: string | null = null;
    try {
      currentDeviceId = getDeviceId();
    } catch {
      // SSR or localStorage unavailable — cannot determine current device.
    }

    return data.map((row) => ({
      id: row.id,
      device_name: row.device_name,
      device_type: row.device_type as UserSessionTable["device_type"],
      browser_name: row.browser_name ?? null,
      created_at: row.created_at,
      last_active_at: row.last_active_at,
      is_current: row.device_id === currentDeviceId,
    }));
  }

  /**
   * Revoke a specific device session by its row ID.
   *
   * Tries the `revoke_device_session` RPC first (SECURITY DEFINER),
   * and falls back to direct table UPDATE if RPC is not available.
   */
  async revokeDeviceSession(sessionId: number): Promise<boolean> {
    const supabase = this.getClient();

    // 1. Try secure RPC first (SECURITY DEFINER — bypasses RLS)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("revoke_device_session", {
        p_session_id: sessionId,
      });

      if (rpcError) {
        console.warn("revoke_device_session RPC error (falling back to direct update):", rpcError.message);
      } else if (rpcData) {
        const result = rpcData as { success?: boolean; reason?: string };
        if (result.success) {
          return true;
        }
        console.warn("revoke_device_session RPC returned:", result.reason);
      }
    } catch (err) {
      console.warn("revoke_device_session RPC unavailable:", err);
    }

    // 2. Fallback: direct UPDATE scoped by the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("Cannot revoke device session: user is not authenticated.");
      return false;
    }

    const { data, error } = await supabase
      .from("user_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .is("revoked_at", null)
      .select("id");

    if (error) {
      console.error("Failed to revoke device session:", error.message, error);
      return false;
    }

    if (!data || data.length === 0) {
      console.error(
        "Device session revocation had no effect.",
        "Session ID:", sessionId,
        "User ID:", user.id,
        "Ensure the UPDATE RLS policy exists and the revoke_device_session RPC function is deployed."
      );
      return false;
    }

    return true;
  }

  /**
   * Revoke the device session belonging to the current browser.
   *
   * Used during logout — ends the QuizStep device session
   * without removing the device_id from localStorage.
   */
  async revokeCurrentDeviceSession(): Promise<boolean> {
    const supabase = this.getClient();

    let currentDeviceId: string | null = null;
    try {
      currentDeviceId = getDeviceId();
    } catch {
      // SSR or localStorage unavailable.
      return false;
    }

    if (!currentDeviceId) {
      return false;
    }

    // 1. Try secure RPC first (SECURITY DEFINER — bypasses RLS)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("revoke_device_session", {
        p_device_id: currentDeviceId,
      });

      if (rpcError) {
        console.warn("revoke_device_session RPC error on current device (falling back to direct update):", rpcError.message);
      } else if (rpcData) {
        const result = rpcData as { success?: boolean; reason?: string };
        if (result.success) {
          this.notifyLocalTabsOfRevocation();
          return true;
        }
        console.warn("revoke_device_session RPC returned for current device:", result.reason);
      }
    } catch (err) {
      console.warn("revoke_device_session RPC unavailable for current device:", err);
    }

    // 2. Fallback: direct UPDATE scoped by the authenticated user
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from("user_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("device_id", currentDeviceId)
        .is("revoked_at", null)
        .select("id");

      if (error) {
        console.error("Failed to revoke current device session via table update:", error.message);
        return false;
      }

      if (!data || data.length === 0) {
        return false;
      }

      this.notifyLocalTabsOfRevocation();
      return true;
    } catch (err) {
      console.error("Exception during direct device session revocation:", err);
      return false;
    }
  }

  /**
   * Broadcasts a revocation event to other tabs in the same browser.
   */
  notifyLocalTabsOfRevocation() {
    if (typeof window === "undefined") return;
    try {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("quizstep_session_channel");
        bc.postMessage({ type: "SESSION_REVOKED", timestamp: Date.now() });
        bc.close();
      }
      localStorage.setItem("quizstep_session_revoked_at", Date.now().toString());
    } catch {
      // Best-effort cross-tab sync
    }
  }

  /**
   * Check whether this specific device has an EXPLICITLY REVOKED session.
   *
   * Checks only the MOST RECENT session row for this device.
   * Old historical revoked rows are ignored — a device that
   * re-registered after being revoked is considered active.
   *
   * Returns:
   * - `true`: This browser's most recent session was explicitly revoked.
   * - `false`: The most recent session is active, or no session exists.
   *
   * @param userId  Optional — skips the getUser() network call when provided.
   */
  async isCurrentDeviceRevoked(userId?: string): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    let currentDeviceId: string | null = null;
    try {
      currentDeviceId = getDeviceId();
    } catch {
      return false;
    }

    if (!currentDeviceId) {
      return false;
    }

    const supabase = this.getClient();

    // Resolve user ID: prefer the provided value to avoid a network call.
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      resolvedUserId = user?.id;
    }

    if (!resolvedUserId) {
      return false;
    }

    // Fetch the MOST RECENT session for this device (active or revoked).
    // Ordering by created_at DESC ensures old revoked rows don't cause
    // false positives after the device has re-registered.
    const { data, error } = await supabase
      .from("user_sessions")
      .select("id, revoked_at")
      .eq("user_id", resolvedUserId)
      .eq("device_id", currentDeviceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("Device session revocation check encountered an error:", error.message);
      return false;
    }

    // Revoked only when the most recent session has an explicit revoked_at.
    // No session at all → not revoked (device never registered or was cleaned up).
    return data !== null && data.revoked_at !== null;
  }

  /**
   * Check whether this device has an ACTIVE (non-revoked, non-expired) session.
   *
   * Used during session restoration to detect and handle devices that
   * authenticated via Supabase but never completed device registration
   * (e.g. closed the DeviceLimitScreen tab).
   *
   * @param userId  Optional — skips the getUser() network call when provided.
   */
  async hasActiveDeviceSession(userId?: string): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    let currentDeviceId: string | null = null;
    try {
      currentDeviceId = getDeviceId();
    } catch {
      return false;
    }

    if (!currentDeviceId) {
      return false;
    }

    const supabase = this.getClient();

    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      resolvedUserId = user?.id;
    }

    if (!resolvedUserId) {
      return false;
    }

    const { data, error } = await supabase
      .from("user_sessions")
      .select("id")
      .eq("user_id", resolvedUserId)
      .eq("device_id", currentDeviceId)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("Active device session check error:", error.message);
      return false;
    }

    return data !== null;
  }

  /**
   * Subscribe to real-time session revocation for this device.
   *
   * When another device revokes this device's session,
   * Supabase Realtime sends an UPDATE payload.
   * If the payload indicates revoked_at is set for this device_id,
   * `onRevoked` is triggered immediately.
   */
  subscribeToRevocation(userId: string, onRevoked: () => void): () => void {
    if (typeof window === "undefined") {
      return () => {};
    }

    const supabase = this.getClient();
    let currentDeviceId: string | null = null;
    try {
      currentDeviceId = getDeviceId();
    } catch {
      return () => {};
    }

    if (!currentDeviceId) {
      return () => {};
    }

    const channelName = `session_revocation_${userId}_${currentDeviceId.slice(0, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_sessions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newRecord = payload.new as { device_id?: string; revoked_at?: string | null };
          if (
            newRecord &&
            newRecord.device_id === currentDeviceId &&
            newRecord.revoked_at !== null &&
            newRecord.revoked_at !== undefined
          ) {
            onRevoked();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Extends the session expiration by 14 days (sliding window)
   * and updates last_active_at whenever the user uses QuizStep.
   *
   * Throttled to at most once every 1 hour to minimize database queries.
   */
  async touchDeviceSession(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    let currentDeviceId: string | null = null;
    try {
      currentDeviceId = getDeviceId();
    } catch {
      return false;
    }

    if (!currentDeviceId) return false;

    // Check throttle (1 hour = 3600000 ms)
    const TOUCH_KEY = `quizstep_last_touch_${currentDeviceId.slice(0, 8)}`;
    const lastTouchStr = localStorage.getItem(TOUCH_KEY);
    const now = Date.now();
    if (lastTouchStr) {
      const lastTouch = parseInt(lastTouchStr, 10);
      if (!isNaN(lastTouch) && now - lastTouch < 3600000) {
        return true;
      }
    }

    const supabase = this.getClient();

    try {
      const { data, error } = await supabase.rpc("touch_device_session", {
        p_device_id: currentDeviceId,
      });

      if (error) {
        console.warn("touch_device_session RPC error:", error.message);
        return false;
      }

      const result = data as { success?: boolean };
      if (result && result.success) {
        localStorage.setItem(TOUCH_KEY, now.toString());
        return true;
      }

      return false;
    } catch (err) {
      console.warn("Failed to touch device session:", err);
      return false;
    }
  }
}

export const deviceSessionService = new DeviceSessionService();
