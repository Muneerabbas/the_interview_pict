import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BarChart3 } from "lucide-react";

import Navbar from "@/components/Navbar";
import PlacementCharts from "@/components/placements/PlacementCharts";
import PlacementsTable from "@/components/placements/PlacementsTable";
import { hostFromHeaders, isPlacementHost } from "@/lib/host-gate";
import { getMongoDb } from "@/lib/mongodb";
import { fetchWithCache } from "@/lib/cache";
import { summarise } from "@/lib/placement-stats";

// Required: the host gate reads headers(), and the response must never be
// cached -- a 404 held for theinterviewroom.in must not be replayed to pict.live.
// Do not add `revalidate` or `force-static` to this route.
export const dynamic = "force-dynamic";

const YEAR = "2025-26";

// Absolute URLs on purpose: app/layout.js sets metadataBase to
// theinterviewroom.in, so a relative canonical would point at the domain where
// this page does not exist.
export const metadata = {
  title: "PICT Placements 2025-26 | Company-wise Statistics",
  description:
    "Complete 2025-26 PICT campus placement statistics: 591 offers across 110 drives and 100 companies, with branch-wise, package-wise and recruiter-wise breakdowns.",
  alternates: { canonical: "https://pict.live/placements" },
  openGraph: {
    title: "PICT Placements 2025-26",
    description: "591 offers, 110 drives, 100 companies. Full company-wise placement statistics.",
    url: "https://pict.live/placements",
    siteName: "pict.live",
    type: "website",
  },
};

async function loadPlacements() {
  try {
    return await fetchWithCache("placements_2025_26", 3600, async () => {
      const db = await getMongoDb({ mode: "read" });
      // _id is projected out rather than stringified after the fact: it keeps the
      // payload JSON-safe for both Redis and the RSC boundary in one step.
      return db
        .collection("placements")
        .find(
          { year: YEAR },
          { projection: { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 } }
        )
        .sort({ group: 1, sr: 1 })
        .toArray();
    });
  } catch (error) {
    // Same contract as app/companies/page.jsx: render an empty state, never a 500.
    console.error("Failed to load placement statistics:", error?.message || error);
    return [];
  }
}

export default async function PlacementsPage() {
  const requestHeaders = await headers();
  if (!isPlacementHost(hostFromHeaders((key) => requestHeaders.get(key)))) {
    notFound();
  }

  const raw = await loadPlacements();
  const rows = raw.map((row) => ({
    sr: Number(row.sr) || 0,
    company: String(row.company || ""),
    group: row.group === "II" ? "II" : "I",
    ce: Number(row.ce) || 0,
    entc: Number(row.entc) || 0,
    it: Number(row.it) || 0,
    mce: Number(row.mce) || 0,
    metc: Number(row.metc) || 0,
    mds: Number(row.mds) || 0,
    male: Number(row.male) || 0,
    female: Number(row.female) || 0,
    total: Number(row.total) || 0,
    lpa: Number(row.lpa) || 0,
    totalLpa: Number(row.totalLpa) || 0,
    ceLpa: Number(row.ceLpa) || 0,
    entcLpa: Number(row.entcLpa) || 0,
    itLpa: Number(row.itLpa) || 0,
    sourceIncomplete: Boolean(row.sourceIncomplete),
  }));

  const stats = rows.length ? summarise(rows) : null;

  return (
    <main className="relative min-h-screen overflow-x-clip bg-slate-50 font-sans dark:bg-slate-950">
      <Navbar showThemeToggle />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <header className="mb-8">
          <h1 className="flex items-center gap-3 pb-1 text-[26px] font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
              <BarChart3 className="text-blue-600 dark:text-blue-400" size={22} />
            </span>
            Placements {YEAR}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            Every recruiting drive from the PICT Training &amp; Placement Report, company by
            company &mdash; packages, branch splits and who actually hired at volume.
          </p>
        </header>

        {stats ? (
          <>
            <PlacementCharts stats={stats} />
            <PlacementsTable rows={rows} />
          </>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <BarChart3 size={28} className="mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              Placement data unavailable
            </h3>
            <p className="mt-1 text-sm">Please try again in a moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}
