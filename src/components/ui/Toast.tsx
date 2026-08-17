"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";

type ToastKind = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  show: (kind: ToastKind, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastKind, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS: Record<ToastKind, string> = {
  success: "border-l-green-500 text-green-400",
  error: "border-l-red-500 text-red-400",
  warning: "border-l-amber-500 text-amber-400",
  info: "border-l-brand-blue text-brand-blue",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Math.random().toString(36).slice(2);
      setItems((prev) => [...prev, { id, kind, message }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
        {items.map((item) => {
          const Icon = ICONS[item.kind];
          return (
            <div
              key={item.id}
              className={clsx(
                "flex items-start gap-2 rounded-lg border border-border bg-bg-surface border-l-4 px-4 py-3 shadow-lg text-sm text-text-primary animate-in fade-in slide-in-from-bottom-2",
                COLORS[item.kind]
              )}
              role="status"
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <span className="flex-1 text-text-primary">{item.message}</span>
              <button
                onClick={() => dismiss(item.id)}
                className="text-text-muted hover:text-text-primary"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
