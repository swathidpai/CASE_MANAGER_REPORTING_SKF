"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  ListChecks,
  Wrench,
  ClipboardCheck,
  Settings,
} from "lucide-react";
import clsx from "clsx";
import { useUnsavedChangesGuard } from "@/lib/useUnsavedChangesGuard";

type RailItem = {
  icon: React.ElementType;
  label: string;
  href?: string;
  matchPrefix?: string;
};

const TOP_ITEMS: RailItem[] = [
  { icon: LayoutGrid, label: "Dashboard" },
  { icon: FileText, label: "Reports", href: "/reports", matchPrefix: "/reports" },
  {
    icon: ListChecks,
    label: "Templates",
    href: "/templates",
    matchPrefix: "/templates",
  },
  { icon: Wrench, label: "Tools" },
  { icon: ClipboardCheck, label: "Checklists" },
];

function RailButton({ item, active }: { item: RailItem; active: boolean }) {
  const Icon = item.icon;
  const { navigate } = useUnsavedChangesGuard();
  const classes = clsx(
    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
    active
      ? "bg-brand-blue/15 text-brand-blue"
      : "text-text-muted hover:bg-bg-surfaceHover hover:text-text-secondary"
  );

  if (item.href) {
    return (
      <button
        type="button"
        onClick={() => navigate(item.href!)}
        className={classes}
        title={item.label}
        aria-label={item.label}
      >
        <Icon size={19} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={clsx(classes, "cursor-default opacity-50")}
      title={`${item.label} (not available in this build)`}
      aria-disabled="true"
    >
      <Icon size={19} />
    </button>
  );
}

export function IconRail() {
  const pathname = usePathname();

  return (
    <aside className="flex w-14 shrink-0 flex-col items-center justify-between border-r border-border bg-bg-rail py-4">
      <div className="flex flex-col gap-2">
        {TOP_ITEMS.map((item) => (
          <RailButton
            key={item.label}
            item={item}
            active={!!item.matchPrefix && pathname.startsWith(item.matchPrefix)}
          />
        ))}
      </div>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted opacity-50 hover:bg-bg-surfaceHover hover:text-text-secondary"
        title="Settings (not available in this build)"
        aria-disabled="true"
      >
        <Settings size={19} />
      </button>
    </aside>
  );
}
