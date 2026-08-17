"use client";

import React, { useMemo, useState } from "react";
import { Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Asset } from "@/lib/types";
import { makeId } from "@/lib/id";
import { parseAssetExcel, toAssets, ParsedAsset } from "@/lib/excelParser";
import { useToast } from "@/components/ui/Toast";

export function AssetsEditor({
  assets,
  onChange,
  siteName,
}: {
  assets: Asset[];
  onChange: (next: Asset[]) => void;
  siteName: string;
}) {
  const { show } = useToast();
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [pendingUpload, setPendingUpload] = useState<ParsedAsset[] | null>(
    null
  );
  const [manualGroup, setManualGroup] = useState("");
  const [manualName, setManualName] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, Asset[]>();
    for (const asset of assets) {
      const key = asset.group || "Ungrouped";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(asset);
    }
    return Array.from(map.entries());
  }, [assets]);

  async function handleFile(file: File) {
    setParseError(null);
    setParsing(true);
    const result = await parseAssetExcel(file);
    setParsing(false);

    if (!result.ok) {
      setParseError(result.error);
      show("error", result.error);
      return;
    }
    if (result.warnings.length > 0) {
      show("warning", result.warnings.join(" "));
    }
    if (assets.length > 0) {
      setPendingUpload(result.assets);
    } else {
      onChange(toAssets(result.assets, siteName));
      show("success", `Imported ${result.assets.length} assets.`);
    }
  }

  function resolvePendingUpload(mode: "replace" | "append") {
    if (!pendingUpload) return;
    const incoming = toAssets(pendingUpload, siteName);
    if (mode === "replace") {
      onChange(incoming);
      show("success", `Replaced asset list with ${incoming.length} assets.`);
    } else {
      const existingPaths = new Set(
        assets.map((a) => a.path.toLowerCase())
      );
      const merged = [...assets];
      let added = 0;
      let skipped = 0;
      for (const asset of incoming) {
        if (existingPaths.has(asset.path.toLowerCase())) {
          skipped += 1;
          continue;
        }
        merged.push(asset);
        existingPaths.add(asset.path.toLowerCase());
        added += 1;
      }
      onChange(merged);
      show(
        "success",
        `Added ${added} asset${added === 1 ? "" : "s"}.${
          skipped > 0 ? ` Skipped ${skipped} already in the list.` : ""
        }`
      );
    }
    setPendingUpload(null);
  }

  function removeAsset(id: string) {
    onChange(assets.filter((a) => a.id !== id));
  }

  function updateAssetName(id: string, name: string) {
    onChange(
      assets.map((a) =>
        a.id === id ? { ...a, name, path: `${siteName}/${name}` } : a
      )
    );
  }

  function addManual() {
    const name = manualName.trim();
    if (!name) return;
    const group = manualGroup.trim() || "Manually added";
    const path = `${siteName}/${name}`;
    if (assets.some((a) => a.path.toLowerCase() === path.toLowerCase())) {
      show("warning", `"${name}" is already in the asset list.`);
      return;
    }
    onChange([
      ...assets,
      { id: makeId("ast"), path, group, name, source: "manual" },
    ]);
    setManualName("");
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-primary">Add Assets</h2>

      <div className="mt-3">
        <FileDropzone onFile={handleFile} />
      </div>

      {parsing && (
        <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 size={14} className="animate-spin" />
          Parsing workbook…
        </div>
      )}
      {parseError && (
        <div className="mt-2 flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-400">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {parseError}
        </div>
      )}

      <div className="mt-4 flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs text-text-muted">Location (optional)</label>
          <Input
            value={manualGroup}
            onChange={(e) => setManualGroup(e.target.value)}
            placeholder="e.g. Engine Room 1"
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-text-muted">Asset name</label>
          <Input
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="e.g. Ballast Pump No 1"
            className="mt-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addManual();
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={addManual}
          disabled={!manualName.trim()}
        >
          <Plus size={15} />
          Add
        </Button>
      </div>

      {assets.length > 0 && (
        <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-border">
          {grouped.map(([group, groupAssets]) => (
            <div key={group}>
              <div className="sticky top-0 bg-bg-surfaceHover px-3 py-1.5 text-xs font-semibold text-text-secondary">
                {group}
              </div>
              {groupAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-2 border-t border-border/60 px-3 py-1.5"
                >
                  <Input
                    value={asset.name}
                    onChange={(e) => updateAssetName(asset.id, e.target.value)}
                    className="h-8 py-1 text-sm"
                  />
                  <span className="w-16 shrink-0 text-[11px] uppercase tracking-wide text-text-muted">
                    {asset.source}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAsset(asset.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Remove asset"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {assets.length === 0 && !parsing && (
        <p className="mt-4 text-sm text-text-muted">
          No assets yet. Upload a SAP export or add assets manually.
        </p>
      )}

      <Dialog open={!!pendingUpload} onClose={() => setPendingUpload(null)}>
        <h2 className="text-base font-semibold text-text-primary">
          Replace or append assets?
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          This template already has {assets.length} asset
          {assets.length === 1 ? "" : "s"}. The uploaded file contains{" "}
          {pendingUpload?.length ?? 0} asset
          {(pendingUpload?.length ?? 0) === 1 ? "" : "s"}. Replace the
          existing list, or append the new assets to it?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingUpload(null)}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => resolvePendingUpload("append")}
          >
            Append
          </Button>
          <Button
            variant="primary"
            onClick={() => resolvePendingUpload("replace")}
          >
            Replace
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
