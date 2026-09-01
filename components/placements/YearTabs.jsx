import Link from "next/link";

/**
 * Year switcher. Server component -- these are plain links, so switching year is
 * a normal navigation and each year gets its own shareable URL. The newest year
 * lives at /placements so the bare URL always shows the latest report.
 */
export default function YearTabs({ years, active, latest, missing = [] }) {
  return (
    <nav aria-label="Placement year" className="mb-8">
      <div className="flex flex-wrap items-center gap-2">
        {years.map((year) => {
          const isActive = year === active;
          return (
            <Link
              key={year}
              href={year === latest ? "/placements" : `/placements/${year}`}
              aria-current={isActive ? "page" : undefined}
              className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-bold tabular-nums transition-all ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-900/40"
              }`}
            >
              {year}
            </Link>
          );
        })}

        {missing.map((year) => (
          <span
            key={year}
            title="PICT published this year only as a scanned image, so it has no machine-readable table."
            className="cursor-not-allowed whitespace-nowrap rounded-xl border border-dashed border-slate-300 bg-transparent px-4 py-2.5 text-sm font-bold tabular-nums text-slate-400 dark:border-slate-700 dark:text-slate-600"
          >
            {year}
          </span>
        ))}
      </div>

      {missing.length ? (
        <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
          {missing.join(", ")} is published only as a scanned image, so its table could not be
          transcribed. Every other year is verified against the report&apos;s own printed totals.
        </p>
      ) : null}
    </nav>
  );
}
