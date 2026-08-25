"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DeviceList } from "@/components/auth/DeviceList";
import { deviceSessionService, type ActiveDevice } from "@/lib/services/deviceSessionService";

// ============================================
// Types
// ============================================

export interface DeviceLimitScreenProps {
  /** Called when a device was revoked and the current device registered successfully. */
  onResolved: () => void;
  /** Called when the user cancels (chooses not to revoke any device). */
  onCancel: () => void;
}

// ============================================
// Component
// ============================================

export function DeviceLimitScreen({ onResolved, onCancel }: DeviceLimitScreenProps) {
  const [devices, setDevices] = useState<ActiveDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active devices on mount.
  useEffect(() => {
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
  }, []);

  // After a device is revoked, re-register the current device.
  const handleDeviceRevoked = useCallback(async () => {
    setError(null);
    setIsRegistering(true);

    try {
      const result = await deviceSessionService.registerCurrentDevice();

      if (result.allowed) {
        onResolved();
        return;
      }

      // Still not allowed — refresh the device list.
      const updatedDevices = await deviceSessionService.getActiveDevices();
      setDevices(updatedDevices);
      setError("Device limit is still reached. Please remove another device to continue.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  }, [onResolved]);

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl shadow-card transition-colors duration-200">
      {/* Header */}
      <div className="text-center mb-6">
        {/* Warning icon */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Device limit reached
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
          Your account is already being used on 2 devices.
          To continue on this device, log out from one of your other devices.
        </p>
      </div>

      {/* Error */}
      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Registering overlay */}
      {isRegistering && (
        <div className="flex items-center justify-center gap-2 py-3 mb-4 text-sm text-[var(--primary-blue)] font-medium">
          <span className="w-4 h-4 border-2 border-[var(--primary-blue)]/30 border-t-[var(--primary-blue)] rounded-full animate-spin" />
          Registering this device…
        </div>
      )}

      {/* Device List */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          Your active devices
        </p>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="w-5 h-5 border-2 border-[var(--border-color)] border-t-[var(--primary-blue)] rounded-full animate-spin" />
          </div>
        ) : (
          <DeviceList
            devices={devices}
            showRevoke={!isRegistering}
            onDeviceRevoked={handleDeviceRevoked}
            onRevokeError={(msg) => setError(msg)}
          />
        )}
      </div>

      {/* Cancel */}
      <div className="pt-4 border-t border-[var(--border-color)]">
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-full"
          onClick={onCancel}
          disabled={isRegistering}
        >
          Cancel
        </Button>
        <p className="text-xs text-[var(--text-secondary)] text-center mt-3">
          You can use QuizStep on up to 2 devices at a time.
        </p>
      </div>
    </div>
  );
}
