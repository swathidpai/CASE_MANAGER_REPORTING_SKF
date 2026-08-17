"use client";

import { TemplateForm } from "@/components/templates/TemplateForm";
import { useApp } from "@/lib/store";

export default function NewTemplatePage() {
  const { ready } = useApp();
  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        Loading…
      </div>
    );
  }
  return <TemplateForm mode="create" />;
}
