import React from "react";
import clsx from "clsx";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-bg-card",
        className
      )}
      {...props}
    />
  );
}
