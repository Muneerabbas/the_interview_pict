import { cn } from "@/lib/utils";

const SIZES = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

/** The single spinner. Four different ones existed before. */
export default function Spinner({ size = "md", className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-[-0.125em]",
        SIZES[size] || SIZES.md,
        className
      )}
    />
  );
}
