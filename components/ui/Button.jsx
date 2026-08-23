"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";

// One radius, one weight, one accent. The app previously had 13 button styles
// and five different spellings of the primary CTA alone.
const VARIANTS = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-400",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
  link: "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500 dark:text-blue-400",
};

const SIZES = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-sm",
  icon: "h-9 w-9",
};

const Button = forwardRef(function Button(
  { as: Tag = "button", variant = "primary", size = "md", loading = false, disabled, className, children, ...props },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <Tag
      ref={ref}
      // A button that can submit must never stay enabled while its request is in
      // flight -- that is how duplicate posts and double likes happened.
      disabled={Tag === "button" ? isDisabled : undefined}
      aria-disabled={Tag === "button" ? undefined : isDisabled || undefined}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
        "disabled:cursor-not-allowed disabled:opacity-70",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        className
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </Tag>
  );
});

export default Button;
