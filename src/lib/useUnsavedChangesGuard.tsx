"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type GuardContextValue = {
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
  guard: (action: () => void) => void;
  navigate: (href: string) => void;
};

const GuardContext = createContext<GuardContextValue | null>(null);

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dirty, setDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const guard = useCallback(
    (action: () => void) => {
      if (!dirty) {
        action();
        return;
      }
      pendingAction.current = action;
      setConfirmOpen(true);
    },
    [dirty]
  );

  const navigate = useCallback(
    (href: string) => {
      guard(() => router.push(href));
    },
    [guard, router]
  );

  return (
    <GuardContext.Provider value={{ dirty, setDirty, guard, navigate }}>
      {children}
      <ConfirmDialog
        open={confirmOpen}
        title="Discard unsaved changes?"
        description="You have unsaved changes to this template. Leaving now will discard them."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        danger
        onConfirm={() => {
          setConfirmOpen(false);
          setDirty(false);
          const action = pendingAction.current;
          pendingAction.current = null;
          action?.();
        }}
        onCancel={() => {
          setConfirmOpen(false);
          pendingAction.current = null;
        }}
      />
    </GuardContext.Provider>
  );
}

export function useUnsavedChangesGuard(): GuardContextValue {
  const ctx = useContext(GuardContext);
  if (!ctx) {
    throw new Error(
      "useUnsavedChangesGuard must be used within UnsavedChangesProvider"
    );
  }
  return ctx;
}
