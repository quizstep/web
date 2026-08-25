"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export function AddMaterialButton() {
  const { user, isLoading } = useAuth();

  if (isLoading || user?.role !== "admin") {
    return null;
  }

  const handleAddMaterial = () => {
    // To be implemented later as per user request
    console.log("Add material clicked");
  };

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleAddMaterial}
      className="shrink-0 shadow-sm whitespace-nowrap"
    >
      <svg
        className="w-4 h-4 mr-1.5 inline-block"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      Add Materials
    </Button>
  );
}
