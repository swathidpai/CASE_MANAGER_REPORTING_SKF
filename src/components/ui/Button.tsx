"use client";

import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dangerSolid";
type Size = "sm" | "md";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand-blue text-white hover:bg-brand-blueHover",
  secondary:
    "bg-bg-input text-text-primary border border-border hover:bg-bg-surfaceHover",
  ghost: "bg-transparent text-text-secondary hover:bg-bg-surfaceHover",
  danger: "bg-transparent text-red-400 border border-red-500/40 hover:bg-red-500/10",
  dangerSolid: "bg-red-500 text-white hover:bg-red-600",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/60",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
