"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Search, Table2, X } from "lucide-react";

/**
 * The only client component on /placements. All 110 rows arrive with the HTML
 * (~6 KB), so search, filter and sort are pure in-memory work -- no API route,
 * no fetch, no debounce.
 */

const COLUMNS = [
  { key: "sr", label: "#", numeric: true },
  { key: "company", label: "Company", numeric: false },
  { key: "ce", label: "CE", numeric: true },
  { key: "entc", label: "E&TC", numeric: true },
  { key: "it", label: "IT", numeric: true },
  { key: "pg", label: "PG", numeric: true },
  { key: "male", label: "M", numeric: true },
  { key: "female", label: "F", numeric: true },
  { key: "total", label: "Total", numeric: true },
  { key: "lpa", label: "LPA", numeric: true },
  { key: "totalLpa", label: "Total LPA", numeric: true },
];

const BRANCH_FILTERS = [
  { key: "all", label: "All" },
  { key: "ce", label: "CE" },
  { key: "entc", label: "E&TC" },
  { key: "it", label: "IT" },
];

const GROUP_FILTERS = [
  { key: "all", label: "Both groups" },
  { key: "I", label: "Group I" },
  { key: "II", label: "Group II" },
];

const pgOf = (r) => r.mce + r.metc + r.mds;
const valueOf = (row, key) => (key === "pg" ? pgOf(row) : row[key]);

export default function PlacementsTable({ rows }) {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("all");
  const [group, setGroup] = useState("all");
  const [sort, setSort] = useState({ key: "total", dir: "desc" });
  const [linked, setLinked] = useState("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (needle && !row.company.toLowerCase().includes(needle)) return false;
      if (group !== "all" && row.group !== group) return false;
      if (branch !== "all" && !(row[branch] > 0)) return false;
      if (linked === "linked" && !row.companySlug) return false;
      if (linked === "unlinked" && row.companySlug) return false;
      return true;
    });

    const { key, dir } = sort;
    const factor = dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (key === "company") return a.company.localeCompare(b.company) * factor;
      const diff = valueOf(a, key) - valueOf(b, key);
      // Stable, readable tiebreak so equal values do not shuffle between sorts.
      return (diff || a.sr - b.sr) * factor;
    });
  }, [rows, query, branch, group, linked, sort]);

  const totals = useMemo(
    () =>
      visible.reduce(
        (acc, r) => {
          acc.ce += r.ce; acc.entc += r.entc; acc.it += r.it; acc.pg += pgOf(r);
          acc.male += r.male; acc.female += r.female; acc.total += r.total;
          acc.totalLpa += r.totalLpa;
          return acc;
        },
        { ce: 0, entc: 0, it: 0, pg: 0, male: 0, female: 0, total: 0, totalLpa: 0 }
      ),
    [visible]
  );

  const toggleSort = (key) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "company" || key === "sr" ? "asc" : "desc" }
    );

  const clearAll = () => { setQuery(""); setBranch("all"); setGroup("all"); setLinked("all"); };
  const isFiltered = query !== "" || branch !== "all" || group !== "all" || linked !== "all";
  const withPage = rows.filter((r) => r.companySlug).length;

  const pill = (active) =>
    `whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
      active
        ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-900/40"
    }`;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
        All {rows.length} drives
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Search, filter and sort the complete company-wise table.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company…"
            aria-label="Search company"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-10 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-blue-900/40 dark:focus:ring-blue-900/10"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by branch">
            {BRANCH_FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setBranch(option.key)}
                aria-pressed={branch === option.key}
                className={pill(branch === option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by group">
            {GROUP_FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setGroup(option.key)}
                aria-pressed={group === option.key}
                className={pill(group === option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
          <button
            type="button"
            onClick={() => setLinked(linked === "unlinked" ? "all" : "unlinked")}
            aria-pressed={linked === "unlinked"}
            title="Companies with no page in the directory yet"
            className={pill(linked === "unlinked")}
          >
            No company page ({rows.length - withPage})
          </button>
          <span className="ml-auto text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {totals.total} of {rows.reduce((a, r) => a + r.total, 0)} offers
          </span>
        </div>
      </div>

      {visible.length ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {COLUMNS.map((column) => {
                    const active = sort.key === column.key;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                        className={`bg-slate-50 p-0 dark:bg-slate-800/60 ${column.numeric ? "text-right" : "text-left"}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className={`flex w-full items-center gap-1 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                            column.numeric ? "justify-end" : "justify-start"
                          } ${
                            active
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                          }`}
                        >
                          {column.label}
                          {active ? (
                            sort.dir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                          ) : null}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {visible.map((row) => (
                  <tr
                    key={`${row.group}-${row.sr}`}
                    className="border-b border-slate-100 odd:bg-slate-50/60 hover:bg-blue-50/40 dark:border-slate-800 dark:odd:bg-slate-800/30 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-3 py-2 text-right tabular-nums text-slate-400 dark:text-slate-500">{row.sr}</td>
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                      {row.companySlug ? (
                        <Link
                          href={`/companies/${row.companySlug}`}
                          className="rounded text-blue-600 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-blue-400"
                        >
                          {row.company}
                        </Link>
                      ) : (
                        row.company
                      )}
                      {row.group === "II" ? (
                        <span className="ml-2 rounded border border-slate-300 px-1 text-[10px] font-normal text-slate-500 dark:border-slate-600 dark:text-slate-400">
                          II
                        </span>
                      ) : null}
                    </td>
                    {["ce", "entc", "it", "pg", "male", "female"].map((key) => {
                      const value = valueOf(row, key);
                      return (
                        <td
                          key={key}
                          className={`px-3 py-2 text-right tabular-nums ${
                            value === 0 ? "text-slate-300 dark:text-slate-700" : "text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">{row.total}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums text-blue-600 dark:text-blue-400">{row.lpa.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-600 dark:text-slate-300">{row.totalLpa.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold dark:border-slate-700 dark:bg-slate-800/60">
                  <td className="px-3 py-2.5" />
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">
                    {visible.length} drive{visible.length === 1 ? "" : "s"} shown
                  </td>
                  {["ce", "entc", "it", "pg", "male", "female", "total"].map((key) => (
                    <td key={key} className="px-3 py-2.5 text-right tabular-nums text-slate-800 dark:text-slate-100">
                      {totals[key]}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 dark:text-slate-100">
                    {totals.total ? (totals.totalLpa / totals.total).toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-800 dark:text-slate-100">
                    {totals.totalLpa.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <Table2 size={28} className="mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No drives match</h3>
          <p className="mt-1 text-sm">Try a different company or branch.</p>
          {isFiltered ? (
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Company names in blue link to their page in the directory; {withPage} of {rows.length} drives
        in this year have one. Rows badged{" "}
        <span className="rounded border border-slate-300 px-1 dark:border-slate-600">II</span> are Group II
        recruiters, below 5 LPA. The footer recomputes for the current filter.
      </p>
    </section>
  );
}
