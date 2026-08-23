import { cn } from "@/lib/utils";

/** One card surface: one radius, one border, one shadow, one dark background. */
export default function Card({ as: Tag = "div", interactive = false, className, children, ...props }) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
        interactive &&
          "transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500/40",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
