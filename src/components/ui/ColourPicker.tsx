"use client";

import React, { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { SEVERITY_PALETTE, colourLabel } from "@/lib/palette";
import { useClickOutside } from "./useClickOutside";

export function ColourPicker({
  value,
  onChange,
  disabledHexes = [],
}: {
  value: string;
  onChange: (hex: string) => void;
  disabledHexes?: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-md border border-border bg-bg-input px-3 py-2.5 text-sm text-text-primary hover:bg-bg-surfaceHover"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
          style={{ backgroundColor: value }}
        />
        <span className="flex-1 text-left">{colourLabel(value)}</span>
        <ChevronDown size={15} className="text-text-muted" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-[180px] rounded-lg border border-border bg-bg-surface p-1.5 shadow-xl">
          {SEVERITY_PALETTE.map((c) => {
            const takenElsewhere =
              disabledHexes.includes(c.hex) &&
              c.hex.toLowerCase() !== value.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                disabled={takenElsewhere}
                onClick={() => {
                  onChange(c.hex);
                  setOpen(false);
                }}
                className={clsx(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm",
                  takenElsewhere
                    ? "cursor-not-allowed opacity-40"
                    : "hover:bg-bg-surfaceHover text-text-primary"
                )}
                title={
                  takenElsewhere ? "Already used by another severity" : c.label
                }
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
                  style={{ backgroundColor: c.hex }}
                />
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
