import React from "react";
import Link from "next/link";

export type Crumb = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-text-muted">/</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-brand-blue hover:underline"
              >
                {item.label}
              </Link>
            ) : item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                className="text-brand-blue hover:underline"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={isLast ? "text-text-primary" : "text-text-secondary"}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
