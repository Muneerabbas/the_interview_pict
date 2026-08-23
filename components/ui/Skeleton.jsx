import { cn } from "@/lib/utils";

/** The single skeleton block; match the real element's radius with `className`. */
export default function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800", className)}
    />
  );
}
