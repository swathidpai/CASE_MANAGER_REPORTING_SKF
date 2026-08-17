"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useUnsavedChangesGuard } from "@/lib/useUnsavedChangesGuard";

export function CreateTemplateCard() {
  const { navigate } = useUnsavedChangesGuard();

  return (
    <button
      type="button"
      onClick={() => navigate("/templates/new")}
      className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-blue/50 bg-brand-blue/5 text-brand-blue transition-colors hover:border-brand-blue hover:bg-brand-blue/10"
    >
      <Plus size={22} />
      <span className="text-sm font-medium">Create Templates</span>
    </button>
  );
}
