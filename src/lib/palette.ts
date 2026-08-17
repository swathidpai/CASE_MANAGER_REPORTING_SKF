export type PaletteColour = {
  id: string;
  label: string;
  hex: string;
};

/**
 * Fixed, contrast-checked palette (WCAG AA against both the dark card
 * background and white cell text) so severity colours stay legible in the
 * compliance matrix (FR-E14). Green is intentionally excluded here: it's
 * reserved for the "measured" event state in the report matrix, so a
 * severity using the same colour would be visually ambiguous.
 */
export const SEVERITY_PALETTE: PaletteColour[] = [
  { id: "red", label: "Red", hex: "#ef4444" },
  { id: "orange", label: "Orange", hex: "#f97316" },
  { id: "amber", label: "Amber", hex: "#f59e0b" },
  { id: "yellow", label: "Yellow", hex: "#eab308" },
  { id: "blue", label: "Blue", hex: "#38bdf8" },
  { id: "purple", label: "Purple", hex: "#a855f7" },
  { id: "pink", label: "Pink", hex: "#ec4899" },
  { id: "gray", label: "Gray", hex: "#94a3b8" },
];

export function colourLabel(hex: string): string {
  return (
    SEVERITY_PALETTE.find((c) => c.hex.toLowerCase() === hex.toLowerCase())
      ?.label ?? "Custom"
  );
}
