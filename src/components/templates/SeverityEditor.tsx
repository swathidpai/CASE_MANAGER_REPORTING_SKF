"use client";

import React from "react";
import { Trash2, ChevronUp, ChevronDown, Plus, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { ColourPicker } from "@/components/ui/ColourPicker";
import { Severity } from "@/lib/types";
import { makeId } from "@/lib/id";
import { SEVERITY_PALETTE } from "@/lib/palette";

function nextUnusedColour(severities: Severity[]): string {
  const used = new Set(severities.map((s) => s.colour.toLowerCase()));
  const free = SEVERITY_PALETTE.find((c) => !used.has(c.hex.toLowerCase()));
  return free?.hex ?? SEVERITY_PALETTE[0].hex;
}

export function SeverityEditor({
  severities,
  onChange,
  reportsGeneratedCount,
}: {
  severities: Severity[];
  onChange: (next: Severity[]) => void;
  reportsGeneratedCount: number;
}) {
  const nameCounts = new Map<string, number>();
  const colourCounts = new Map<string, number>();
  for (const s of severities) {
    const n = s.name.trim().toLowerCase();
    if (n) nameCounts.set(n, (nameCounts.get(n) ?? 0) + 1);
    colourCounts.set(s.colour, (colourCounts.get(s.colour) ?? 0) + 1);
  }

  function update(id: string, patch: Partial<Severity>) {
    onChange(severities.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function remove(id: string) {
    onChange(
      severities
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i }))
    );
  }

  function move(id: string, dir: -1 | 1) {
    const idx = severities.findIndex((s) => s.id === id);
    const swapWith = idx + dir;
    if (idx === -1 || swapWith < 0 || swapWith >= severities.length) return;
    const next = [...severities];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    onChange(next.map((s, i) => ({ ...s, order: i })));
  }

  function add() {
    onChange([
      ...severities,
      {
        id: makeId("sev"),
        name: "",
        colour: nextUnusedColour(severities),
        order: severities.length,
      },
    ]);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">
          Severity Legend
        </h2>
        {reportsGeneratedCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <AlertTriangle size={13} />
            Used in {reportsGeneratedCount} report
            {reportsGeneratedCount === 1 ? "" : "s"} — edits may affect history
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {severities.map((s, i) => {
          const nameDupe = s.name.trim() && (nameCounts.get(s.name.trim().toLowerCase()) ?? 0) > 1;
          const colourDupe = (colourCounts.get(s.colour) ?? 0) > 1;
          return (
            <div key={s.id} className="flex items-start gap-2">
              <div className="w-36 shrink-0">
                <ColourPicker
                  value={s.colour}
                  onChange={(hex) => update(s.id, { colour: hex })}
                  disabledHexes={severities.map((x) => x.colour)}
                />
              </div>
              <div className="flex-1">
                <Input
                  value={s.name}
                  onChange={(e) => update(s.id, { name: e.target.value })}
                  placeholder="Severity name"
                  invalid={!s.name.trim() || !!nameDupe}
                />
                {(nameDupe || colourDupe) && (
                  <p className="mt-1 text-xs text-red-400">
                    {nameDupe && colourDupe
                      ? "Duplicate name and colour"
                      : nameDupe
                      ? "Duplicate severity name"
                      : "Duplicate colour"}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => move(s.id, -1)}
                  disabled={i === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-surfaceHover disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => move(s.id, 1)}
                  disabled={i === severities.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-surfaceHover disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  disabled={severities.length <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                  aria-label="Delete severity"
                  title={
                    severities.length <= 1
                      ? "At least one severity is required"
                      : "Delete severity"
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-3 flex items-center gap-1.5 rounded-md border border-border bg-bg-input px-3 py-2 text-sm text-text-secondary hover:bg-bg-surfaceHover"
      >
        <Plus size={15} />
        Add Severity
      </button>
    </div>
  );
}
