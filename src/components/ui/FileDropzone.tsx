"use client";

import React, { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import clsx from "clsx";

export function FileDropzone({
  onFile,
  accept = ".xlsx,.xls",
  title = "Drop an Excel file here, or click to browse",
  subtitle = ".xlsx or .xls — a SAP work order export",
}: {
  onFile: (file: File) => void;
  accept?: string;
  title?: string;
  subtitle?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={clsx(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors",
        dragging
          ? "border-brand-blue bg-brand-blue/5"
          : "border-border hover:border-border/80 bg-bg-input/40"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <UploadCloud size={28} className="text-text-muted" />
      <div className="text-sm font-medium text-text-primary">{title}</div>
      <div className="text-xs text-text-muted">{subtitle}</div>
    </div>
  );
}
