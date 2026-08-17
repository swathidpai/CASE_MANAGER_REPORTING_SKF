"use client";

import React, { useRef, useState } from "react";
import clsx from "clsx";
import { useClickOutside } from "./useClickOutside";

export type MenuItem = {
  label: string;
  icon?: React.ElementType;
  onSelect: () => void;
  danger?: boolean;
};

export function Menu({
  trigger,
  items,
  align = "end",
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <div
          className={clsx(
            "absolute z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-bg-surface py-1 shadow-xl",
            align === "end" ? "right-0" : "left-0"
          )}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setOpen(false);
                item.onSelect();
              }}
              className={clsx(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg-surfaceHover",
                item.danger ? "text-red-400" : "text-text-primary"
              )}
            >
              {item.icon && <item.icon size={15} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
