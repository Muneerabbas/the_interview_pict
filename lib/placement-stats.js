/**
 * Every figure on /placements is derived here, from the rows, at request time.
 * There is no stored summary document on purpose: a second copy of these numbers
 * is a second thing that can drift away from the rows it claims to describe.
 *
 * Pure and import-free so test/placement-stats.mjs can run it under plain node.
 */

const BRANCHES = [
  { key: "ce", label: "Computer Engineering", short: "CE" },
  { key: "entc", label: "Electronics & Telecom", short: "E&TC" },
  { key: "it", label: "Information Technology", short: "IT" },
];

const BANDS = [
  { label: "30+", lo: 30, hi: Infinity },
  { label: "20 - 30", lo: 20, hi: 30 },
  { label: "15 - 20", lo: 15, hi: 20 },
  { label: "10 - 15", lo: 10, hi: 15 },
  { label: "8 - 10", lo: 8, hi: 10 },
  { label: "5 - 8", lo: 5, hi: 8 },
  { label: "under 5", lo: 0, hi: 5 },
];

const round2 = (n) => Math.round(n * 100) / 100;
const round1 = (n) => Math.round(n * 10) / 10;

/** Averages the middle pair on even length. 591 offers is odd, but filtered
 *  views in the table are not, and a median that is wrong half the time is worse
 *  than no median. */
export function median(nums) {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const pgOf = (r) => (r.mce || 0) + (r.metc || 0) + (r.mds || 0);

/** One entry per offer, so every average is weighted by headcount rather than
 *  by drive -- a 31-offer drive should not count the same as a 1-offer drive. */
function offersOf(rows, branchKey) {
  const out = [];
  for (const r of rows) {
    const n = branchKey ? r[branchKey] || 0 : r.total || 0;
    for (let i = 0; i < n; i += 1) out.push(r.lpa || 0);
  }
  return out;
}

/**
 * The four invariants that validated this dataset against the printed report.
 * Returns [] when clean. The seeder refuses to write past a non-empty result,
 * so a corrupted dataset cannot reach the database or the page.
 *
 * Note the branch-salary check skips sourceIncomplete rows: row 106 (SLB) has
 * blank per-branch salary cells in the source, which is a defect we record
 * rather than a transcription error we should fail on.
 */
export function checkInvariants(rows) {
  const problems = [];
  const near = (a, b) => Math.abs(a - b) <= 0.05;

  for (const r of rows) {
    const at = `sr ${r.sr} (${r.company})`;
    const branchSum =
      (r.ce || 0) + (r.entc || 0) + (r.it || 0) + pgOf(r);

    if (branchSum !== r.total) {
      problems.push(`${at}: branch counts sum to ${branchSum}, total says ${r.total}`);
    }
    if ((r.male || 0) + (r.female || 0) !== r.total) {
      problems.push(`${at}: male+female ${(r.male || 0) + (r.female || 0)} != total ${r.total}`);
    }
    if (!near((r.lpa || 0) * (r.total || 0), r.totalLpa || 0)) {
      problems.push(`${at}: lpa x total = ${round2(r.lpa * r.total)}, totalLpa says ${r.totalLpa}`);
    }
    if (!r.sourceIncomplete) {
      for (const [countKey, salaryKey, label] of [
        ["ce", "ceLpa", "CE"],
        ["entc", "entcLpa", "E&TC"],
        ["it", "itLpa", "IT"],
      ]) {
        const expected = (r[countKey] || 0) * (r.lpa || 0);
        if (!near(expected, r[salaryKey] || 0)) {
          problems.push(
            `${at}: ${label} ${r[countKey]} x ${r.lpa} = ${round2(expected)}, column says ${r[salaryKey]}`
          );
        }
      }
    }
  }
  return problems;
}

export function summarise(rows) {
  const offers = rows.reduce((a, r) => a + (r.total || 0), 0);
  const all = offersOf(rows);
  const sorted = [...all].sort((a, b) => a - b);
  const totalSalary = rows.reduce((a, r) => a + (r.totalLpa || 0), 0);
  const top = rows.reduce((best, r) => (r.lpa > (best?.lpa ?? -1) ? r : best), null);

  // Repeat drives are separate rows ("Flextrade 2", "Amazon (Contractual Basis)"),
  // so distinct employers is smaller than the drive count.
  const employers = new Set(
    rows.map((r) => String(r.company).replace(/\s*(\d+|\(.*?\))\s*$/, "").trim().toLowerCase())
  ).size;

  const branches = BRANCHES.map(({ key, label, short }) => {
    const count = rows.reduce((a, r) => a + (r[key] || 0), 0);
    // Derived from count x package, NOT from the printed per-branch salary column.
    // That column is blank for SLB, which is exactly why the report's own printed
    // CE and IT averages come out low.
    const salary = rows.reduce((a, r) => a + (r[key] || 0) * (r.lpa || 0), 0);
    const printed = rows.reduce((a, r) => a + (r[`${key}Lpa`] || 0), 0);
    const list = offersOf(rows, key);
    return {
      key,
      label,
      short,
      offers: count,
      share: offers ? round1((count / offers) * 100) : 0,
      avgLpa: count ? round2(salary / count) : 0,
      printedAvgLpa: count ? round2(printed / count) : 0,
      medianLpa: round2(median(list)),
      maxLpa: list.length ? round2(Math.max(...list)) : 0,
      minLpa: list.length ? round2(Math.min(...list)) : 0,
    };
  });

  const pgCount = rows.reduce((a, r) => a + pgOf(r), 0);

  const bands = BANDS.map(({ label, lo, hi }) => {
    const count = rows
      .filter((r) => r.lpa >= lo && r.lpa < hi)
      .reduce((a, r) => a + (r.total || 0), 0);
    return { label, offers: count, share: offers ? round1((count / offers) * 100) : 0 };
  });

  const groupOf = (g) => {
    const sub = rows.filter((r) => r.group === g);
    const n = sub.reduce((a, r) => a + (r.total || 0), 0);
    const s = sub.reduce((a, r) => a + (r.totalLpa || 0), 0);
    return { drives: sub.length, offers: n, avgLpa: n ? round2(s / n) : 0 };
  };

  const male = rows.reduce((a, r) => a + (r.male || 0), 0);
  const female = rows.reduce((a, r) => a + (r.female || 0), 0);

  const byHeadcount = [...rows].sort((a, b) => b.total - a.total || b.lpa - a.lpa).slice(0, 12);
  const byPackage = [...rows].sort((a, b) => b.lpa - a.lpa || b.total - a.total).slice(0, 12);

  return {
    headline: {
      offers,
      drives: rows.length,
      employers,
      meanLpa: offers ? round2(totalSalary / offers) : 0,
      medianLpa: round2(median(all)),
      maxLpa: sorted.length ? round2(sorted[sorted.length - 1]) : 0,
      maxCompany: top?.company || "",
      minLpa: sorted.length ? round2(sorted[0]) : 0,
    },
    branches,
    postgrad: { offers: pgCount },
    bands,
    groups: { I: groupOf("I"), II: groupOf("II") },
    gender: {
      male,
      female,
      femaleShare: offers ? round1((female / offers) * 100) : 0,
    },
    topByHeadcount: byHeadcount.map((r) => ({ company: r.company, total: r.total, lpa: r.lpa })),
    topByPackage: byPackage.map((r) => ({ company: r.company, total: r.total, lpa: r.lpa })),
    scatter: rows.map((r) => ({
      company: r.company,
      lpa: r.lpa,
      total: r.total,
      group: r.group,
      lead: dominantBranch(r),
    })),
    incompleteRows: rows.filter((r) => r.sourceIncomplete).map((r) => ({ sr: r.sr, company: r.company })),
  };
}

/** Which branch took the most seats in a drive -- drives the scatter colouring. */
export function dominantBranch(row) {
  const max = Math.max(row.ce || 0, row.entc || 0, row.it || 0);
  if (max === 0) return "pg";
  if ((row.ce || 0) === max) return "ce";
  if ((row.entc || 0) === max) return "entc";
  return "it";
}
