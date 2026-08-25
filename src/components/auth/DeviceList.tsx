"use client";

import React, { useEffect, useState } from "react";
import { deviceSessionService, type ActiveDevice } from "@/lib/services/deviceSessionService";

// ============================================
// Device Icons (inline SVGs)
// ============================================

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function DesktopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function DeviceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function getDeviceIcon(type: ActiveDevice["device_type"]) {
  const iconClass = "w-6 h-6 shrink-0";
  switch (type) {
    case "phone":
      return <PhoneIcon className={iconClass} />;
    case "tablet":
      return <TabletIcon className={iconClass} />;
    case "desktop":
      return <DesktopIcon className={iconClass} />;
    default:
      return <DeviceIcon className={iconClass} />;
  }
}

// ============================================
// Friendly time formatting
// ============================================

function formatLastActive(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return "Just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  return new Date(isoString).toLocaleDateString();
}

function formatLoginDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ============================================
// Component
// ============================================

export interface DeviceListProps {
  /** Show a "Log out this device" button for each non-current device. */
  showRevoke?: boolean;
  /** Called after a device is successfully revoked. */
  onDeviceRevoked?: () => void;
  /** Called when device revocation fails. */
  onRevokeError?: (message: string) => void;
  /** Externally provided devices (skips internal fetch). */
  devices?: ActiveDevice[];
}

export function DeviceList({ showRevoke = false, onDeviceRevoked, onRevokeError, devices: externalDevices }: DeviceListProps) {
  const [devices, setDevices] = useState<ActiveDevice[]>(externalDevices || []);
  const [isLoading, setIsLoading] = useState(!externalDevices);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (externalDevices) {
      setDevices(externalDevices);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function load() {
      const result = await deviceSessionService.getActiveDevices();
      if (isMounted) {
        setDevices(result);
        setIsLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [externalDevices]);

  const handleRevoke = async (sessionId: number) => {
    setRevokingId(sessionId);
    try {
      const success = await deviceSessionService.revokeDeviceSession(sessionId);
      if (success) {
        setDevices((prev) => prev.filter((d) => d.id !== sessionId));
        onDeviceRevoked?.();
      } else {
        onRevokeError?.("Could not revoke device session. Please refresh and try again.");
      }
    } catch {
      onRevokeError?.("An unexpected error occurred while revoking the device.");
    } finally {
      setRevokingId(null);
      setConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="w-5 h-5 border-2 border-[var(--border-color)] border-t-[var(--primary-blue)] rounded-full animate-spin" />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)] text-center py-4">
        No active devices found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {devices.map((device) => (
        <div
          key={device.id}
          className="flex items-start gap-3 p-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl transition-colors duration-200"
        >
          {/* Icon */}
          <div className="mt-0.5 text-[var(--primary-blue)]">
            {getDeviceIcon(device.device_type)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Row 1: Device name + badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {device.device_name || "Unknown Device"}
              </span>
              {device.is_current && (
                <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--primary-blue)] bg-[var(--primary-blue)]/10 rounded">
                  This device
                </span>
              )}
            </div>

            {/* Row 2: Browser · Last active (compact single line) */}
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
              {device.browser_name ? `${device.browser_name} · ` : ""}{formatLastActive(device.last_active_at)}
            </p>
          </div>

          {/* Revoke Action */}
          {showRevoke && !device.is_current && (
            <div className="shrink-0">
              {confirmId === device.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={revokingId === device.id}
                    onClick={() => handleRevoke(device.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-60"
                  >
                    {revokingId === device.id ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Removing…
                      </span>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(device.id)}
                  className="px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  Log out
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
