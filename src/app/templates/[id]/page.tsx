"use client";

import { useParams } from "next/navigation";
import { TemplateForm } from "@/components/templates/TemplateForm";
import { useApp } from "@/lib/store";

export default function EditTemplatePage() {
  const params = useParams<{ id: string }>();
  const { ready } = useApp();
  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        Loading…
      </div>
    );
  }
  return <TemplateForm mode="edit" templateId={params.id} />;
}
