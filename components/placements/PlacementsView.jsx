"use client";

import { useState } from "react";

import PlacementCharts from "./PlacementCharts";
import PlacementsTable from "./PlacementsTable";

/**
 * The branch lens. A student reads this page asking "what are MY odds and MY
 * likely package", so one control at the top re-reads every figure below it --
 * the tiles, the distribution, the recruiter lists and the table all narrow
 * together instead of the reader assembling a branch view out of an all-branch
 * dashboard and one small card.
 *
 * Every branch's summary is computed on the server and shipped up front (four
 * small objects), so switching is a state change, not a fetch.
 */

const LENSES = [
  { key: "all", label: "All branches", activeClass: "bg-slate-900 text-custom-cream dark:bg-slate-100 dark:text-slate-950" },
  { key: "ce", label: "Computer", tint: "#CDC6F7", ink: "#241E5C" },
  { key: "entc", label: "E&TC", tint: "#FFD9A8", ink: "#5A3A0B" },
  { key: "it", label: "IT", tint: "#BCE7CF", ink: "#0C3A26" },
];

export default function PlacementsView({ rows, statsByBranch }) {
  const [branch, setBranch] = useState("all");
  const stats = statsByBranch[branch] || statsByBranch.all;

  return (
    <>
      <div className="mb-8 mt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
          Read this page as
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2" role="group" aria-label="Read the page as one branch">
          {LENSES.map((lens) => {
            const active = branch === lens.key;
            return (
              <button
                key={lens.key}
                type="button"
                onClick={() => setBranch(lens.key)}
                aria-pressed={active}
                className={`rounded-full px-[18px] py-2.5 text-[14px] font-bold transition ${
                  active
                    ? lens.activeClass || ""
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
                style={active && lens.tint ? { backgroundColor: lens.tint, color: lens.ink } : undefined}
              >
                {lens.label}
              </button>
            );
          })}
        </div>
        {branch !== "all" ? (
          <p className="mt-3 text-[13.5px] text-slate-600 dark:text-slate-400">
            Showing the {stats.headline.drives} drives that took{" "}
            {LENSES.find((l) => l.key === branch)?.label} students &mdash; {stats.headline.offers}{" "}
            offers, and packages weighted by those offers alone.
          </p>
        ) : null}
      </div>

      <PlacementCharts stats={stats} />
      <PlacementsTable rows={rows} branch={branch} onBranchChange={setBranch} />
    </>
  );
}
