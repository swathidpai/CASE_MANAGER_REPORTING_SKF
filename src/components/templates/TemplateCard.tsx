"use client";

import React from "react";
import { ArrowRight, MoreVertical, Pencil, Copy, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Menu } from "@/components/ui/Menu";
import { Template } from "@/lib/types";
import { useUnsavedChangesGuard } from "@/lib/useUnsavedChangesGuard";

export function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  template: Template;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { navigate } = useUnsavedChangesGuard();

  return (
    <Card className="flex flex-col p-5 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-text-primary">
          {template.name}
        </h3>
        <Menu
          trigger={
            <span className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-bg-surfaceHover hover:text-text-secondary">
              <MoreVertical size={16} />
            </span>
          }
          items={[
            { label: "Edit", icon: Pencil, onSelect: onEdit },
            { label: "Duplicate", icon: Copy, onSelect: onDuplicate },
            {
              label: "Delete",
              icon: Trash2,
              danger: true,
              onSelect: onDelete,
            },
          ]}
        />
      </div>
      <p className="mt-2 min-h-[2.5rem] text-sm text-text-secondary line-clamp-2">
        {template.description || "Supporting text..."}
      </p>
      <button
        type="button"
        onClick={() => navigate(`/templates/${template.id}`)}
        className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline self-start"
      >
        View template
        <ArrowRight size={14} />
      </button>
    </Card>
  );
}
