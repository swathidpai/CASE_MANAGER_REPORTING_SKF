"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SeverityEditor } from "./SeverityEditor";
import { AssetsEditor } from "./AssetsEditor";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { useUnsavedChangesGuard } from "@/lib/useUnsavedChangesGuard";
import { Asset, Severity, TemplateDraft } from "@/lib/types";
import { makeId } from "@/lib/id";

const NAME_MAX_LENGTH = 120;

function defaultSeverities(): Severity[] {
  return [
    { id: makeId("sev"), name: "High Severity", colour: "#ef4444", order: 0 },
    {
      id: makeId("sev"),
      name: "Medium Severity",
      colour: "#f59e0b",
      order: 1,
    },
    { id: makeId("sev"), name: "Low Severity", colour: "#eab308", order: 2 },
  ];
}

export function TemplateForm({
  mode,
  templateId,
}: {
  mode: "create" | "edit";
  templateId?: string;
}) {
  const router = useRouter();
  const {
    activeSiteId,
    sites,
    getTemplate,
    isNameTaken,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useApp();
  const { show } = useToast();
  const { setDirty, guard } = useUnsavedChangesGuard();

  const existing = mode === "edit" && templateId ? getTemplate(templateId) : undefined;
  const siteName = sites.find((s) => s.id === activeSiteId)?.name ?? "";

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [severities, setSeverities] = useState<Severity[]>(
    existing?.severities ?? defaultSeverities()
  );
  const [assets, setAssets] = useState<Asset[]>(existing?.assets ?? []);
  const [nameError, setNameError] = useState<string | null>(null);
  const [severityError, setSeverityError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialSnapshot = useRef(
    JSON.stringify({
      name: existing?.name ?? "",
      description: existing?.description ?? "",
      severities: existing?.severities ?? [],
      assets: existing?.assets ?? [],
    })
  );

  useEffect(() => {
    if (mode === "edit" && !existing) return;
    const snapshot = JSON.stringify({ name, description, severities, assets });
    setDirty(snapshot !== initialSnapshot.current);
  }, [name, description, severities, assets, mode, existing, setDirty]);

  useEffect(() => {
    return () => setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mode === "edit" && !existing) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-sm text-text-secondary">
          This template couldn&apos;t be found in {siteName}. It may have been
          deleted, or belong to a different site.
        </p>
        <Button variant="secondary" onClick={() => router.push("/templates")}>
          Back to Templates
        </Button>
      </div>
    );
  }

  function validate(): boolean {
    let valid = true;
    const trimmed = name.trim();

    if (!trimmed) {
      setNameError("Template name is required.");
      valid = false;
    } else if (trimmed.length > NAME_MAX_LENGTH) {
      setNameError(`Template name must be ${NAME_MAX_LENGTH} characters or fewer.`);
      valid = false;
    } else if (isNameTaken(trimmed, existing?.id)) {
      setNameError("A template with this name already exists for this site.");
      valid = false;
    } else {
      setNameError(null);
    }

    if (severities.length === 0) {
      setSeverityError("At least one severity is required.");
      valid = false;
    } else {
      const names = new Map<string, number>();
      const colours = new Map<string, number>();
      let hasEmpty = false;
      for (const s of severities) {
        const n = s.name.trim().toLowerCase();
        if (!n || !s.colour) hasEmpty = true;
        if (n) names.set(n, (names.get(n) ?? 0) + 1);
        colours.set(s.colour, (colours.get(s.colour) ?? 0) + 1);
      }
      const hasDupeName = Array.from(names.values()).some((c) => c > 1);
      const hasDupeColour = Array.from(colours.values()).some((c) => c > 1);
      if (hasEmpty) {
        setSeverityError("Every severity needs a name and a colour.");
        valid = false;
      } else if (hasDupeName || hasDupeColour) {
        setSeverityError(
          hasDupeName && hasDupeColour
            ? "Severity names and colours must be unique."
            : hasDupeName
            ? "Severity names must be unique."
            : "Severity colours must be unique."
        );
        valid = false;
      } else {
        setSeverityError(null);
      }
    }

    return valid;
  }

  function handleSave() {
    if (!validate()) {
      show("error", "Please fix the highlighted fields before saving.");
      return;
    }
    setSaving(true);
    try {
      const draft: TemplateDraft = {
        siteId: activeSiteId,
        name: name.trim(),
        description,
        severities,
        assets,
      };
      const saved =
        mode === "create"
          ? createTemplate(draft)
          : updateTemplate(existing!.id, draft);
      initialSnapshot.current = JSON.stringify({
        name: draft.name,
        description: draft.description,
        severities: draft.severities,
        assets: draft.assets,
      });
      setDirty(false);
      show(
        "success",
        mode === "create" ? "Template created." : "Template saved."
      );
      router.push(`/templates/${saved.id}`);
    } catch {
      show(
        "error",
        "Couldn't save the template. Your changes are still here — please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { label: "Templates", onClick: () => guard(() => router.push("/templates")) },
            { label: existing?.name || "New template" },
          ]}
        />
        {mode === "edit" && (
          <Button variant="secondary" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        )}
      </div>

      <Card className="mt-6 p-6">
        <label className="text-sm font-semibold text-text-primary">
          Template Name
        </label>
        <Input
          className="mt-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={NAME_MAX_LENGTH}
          placeholder="New Team 1"
          invalid={!!nameError}
        />
        {nameError && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
            <AlertCircle size={12} />
            {nameError}
          </p>
        )}
      </Card>

      <Card className="mt-4 p-6">
        <label className="text-sm font-semibold text-text-primary">
          Template description
        </label>
        <Textarea
          className="mt-2"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-text-muted">
          This will show as notes in the report
        </p>
      </Card>

      <Card className="mt-4 p-6">
        <SeverityEditor
          severities={severities}
          onChange={setSeverities}
          reportsGeneratedCount={existing?.reportsGeneratedCount ?? 0}
        />
        {severityError && (
          <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
            <AlertCircle size={12} />
            {severityError}
          </p>
        )}
      </Card>

      <Card className="mt-4 p-6">
        <AssetsEditor assets={assets} onChange={setAssets} siteName={siteName} />
      </Card>

      <div className="mt-6 flex justify-between">
        <Button
          variant="secondary"
          onClick={() => guard(() => router.push("/templates"))}
        >
          Back
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save and Next"}
        </Button>
      </div>

      {existing && (
        <ConfirmDialog
          open={deleteOpen}
          title={`Delete "${existing.name}"?`}
          description={
            existing.reportsGeneratedCount > 0 ? (
              <>
                This template has been used to generate{" "}
                <strong className="text-text-primary">
                  {existing.reportsGeneratedCount} report
                  {existing.reportsGeneratedCount === 1 ? "" : "s"}
                </strong>
                . Those reports keep their own data, but you won&apos;t be
                able to generate new reports from this template once it&apos;s
                deleted.
              </>
            ) : (
              "This can't be undone."
            )
          }
          confirmLabel="Delete template"
          danger
          onConfirm={() => {
            deleteTemplate(existing.id);
            setDirty(false);
            setDeleteOpen(false);
            show("success", `Deleted "${existing.name}"`);
            router.push("/templates");
          }}
          onCancel={() => setDeleteOpen(false)}
        />
      )}
    </div>
  );
}
