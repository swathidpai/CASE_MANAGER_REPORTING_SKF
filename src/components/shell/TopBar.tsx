"use client";

import React from "react";
import { ChevronDown, HelpCircle, Check } from "lucide-react";
import { useApp } from "@/lib/store";
import { Menu } from "@/components/ui/Menu";
import { useUnsavedChangesGuard } from "@/lib/useUnsavedChangesGuard";

export function TopBar() {
  const { sites, activeSiteId, setActiveSiteId } = useApp();
  const { guard } = useUnsavedChangesGuard();
  const activeSite = sites.find((s) => s.id === activeSiteId);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg-rail px-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold tracking-tight">
          <span className="text-brand-teal">Wind</span>
          <span className="text-white">AI</span>
        </span>
        <span className="text-sm font-medium text-text-secondary">
          Reporting Matrix
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Menu
          align="end"
          trigger={
            <span className="flex items-center gap-1.5 rounded-md bg-bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-bg-surfaceHover">
              {activeSite?.name}
              <ChevronDown size={14} className="text-text-muted" />
            </span>
          }
          items={sites.map((site) => ({
            label: site.name,
            icon: site.id === activeSiteId ? Check : undefined,
            onSelect: () => {
              if (site.id === activeSiteId) return;
              guard(() => setActiveSiteId(site.id));
            },
          }))}
        />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-bg-surfaceHover hover:text-text-secondary"
          title="Help"
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-xs font-semibold text-white"
          title="Jane Doe"
        >
          JD
        </span>
      </div>
    </header>
  );
}
