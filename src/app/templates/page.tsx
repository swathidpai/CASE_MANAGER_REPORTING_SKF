"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { useUnsavedChangesGuard } from "@/lib/useUnsavedChangesGuard";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { CreateTemplateCard } from "@/components/templates/CreateTemplateCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Template } from "@/lib/types";

export default function TemplatesPage() {
  const { ready, templates, sites, activeSiteId, duplicateTemplate, deleteTemplate } =
    useApp();
  const { show } = useToast();
  const { navigate } = useUnsavedChangesGuard();
  const [pendingDelete, setPendingDelete] = useState<Template | null>(null);

  const activeSite = sites.find((s) => s.id === activeSiteId);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        Loading templates…
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      <p className="text-xs text-text-muted">Templates</p>
      <h1 className="mt-1 text-2xl font-semibold text-text-primary">
        Templates
      </h1>
      <p className="mt-1 max-w-xl text-sm text-text-secondary">
        Create templates for your reports with preset severities and assets.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CreateTemplateCard />
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => navigate(`/templates/${template.id}`)}
            onDuplicate={() => {
              const clone = duplicateTemplate(template.id);
              show("success", `Duplicated as "${clone.name}"`);
            }}
            onDelete={() => setPendingDelete(template)}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <p className="mt-6 text-sm text-text-muted">
          No templates yet for {activeSite?.name}. Create one to preset
          severities and assets for this site&apos;s reports.
        </p>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.name}"?`}
        description={
          pendingDelete && pendingDelete.reportsGeneratedCount > 0 ? (
            <>
              This template has been used to generate{" "}
              <strong className="text-text-primary">
                {pendingDelete.reportsGeneratedCount} report
                {pendingDelete.reportsGeneratedCount === 1 ? "" : "s"}
              </strong>
              . Those reports keep their own data, but you won&apos;t be able
              to generate new reports from this template once it&apos;s
              deleted.
            </>
          ) : (
            "This can't be undone."
          )
        }
        confirmLabel="Delete template"
        danger
        onConfirm={() => {
          if (pendingDelete) {
            deleteTemplate(pendingDelete.id);
            show("success", `Deleted "${pendingDelete.name}"`);
          }
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
