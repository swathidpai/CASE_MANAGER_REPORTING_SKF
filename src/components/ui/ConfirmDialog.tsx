"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} labelledBy="confirm-dialog-title">
      <div className="flex items-start gap-3">
        {danger && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertTriangle size={18} />
          </span>
        )}
        <div className="flex-1">
          <h2
            id="confirm-dialog-title"
            className="text-base font-semibold text-text-primary"
          >
            {title}
          </h2>
          <div className="mt-2 text-sm text-text-secondary">{description}</div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? "dangerSolid" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
