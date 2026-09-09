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

    // Rows carrying a flag failed this check in the printed report itself. They
    // are recorded, not rejected -- dropping them would lose real placements and
    // stop the year reconciling against its own totals.
    if (!r.branchMismatch && branchSum !== r.total) {
      problems.push(`${at}: branch counts sum to ${branchSum}, total says ${r.total}`);
    }
    if (!r.genderMismatch && (r.male || 0) + (r.female || 0) !== r.total) {
      problems.push(`${at}: male+female ${(r.male || 0) + (r.female || 0)} != total ${r.total}`);
    }
    // A banded salary has no exact product; lpa was derived as totalLpa/total.
    if (!r.salaryBand && !near((r.lpa || 0) * (r.total || 0), r.totalLpa || 0)) {
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

/**
 * `branch` narrows every figure to one branch's column: a CE reader gets CE
 * offers, CE packages and the drives that actually took CE students, not the
 * all-branch numbers with a CE card bolted on the side.
 *
 * Two things genuinely do not exist per branch and come back null rather than
 * being faked: the gender split (the source prints male/female per drive, not
 * per branch) and the three-way branch comparison, which is the all-branch view.
 */
export function summarise(rows, branch = null) {
  const key = BRANCHES.some((b) => b.key === branch) ? branch : null;
  const countOf = key ? (r) => r[key] || 0 : (r) => r.total || 0;
  // A drive that took nobody from this branch is not part of its story.
  const scoped = key ? rows.filter((r) => countOf(r) > 0) : rows;

  const offers = scoped.reduce((a, r) => a + countOf(r), 0);
  const all = offersOf(scoped, key);
  const sorted = [...all].sort((a, b) => a - b);
  // The all-branch total stays on the printed totalLpa column; a branch total has
  // no printed equivalent that is trustworthy (it is blank for SLB), so it is
  // derived from headcount x package, the same way the branch cards are.
  const totalSalary = key
    ? scoped.reduce((a, r) => a + countOf(r) * (r.lpa || 0), 0)
    : scoped.reduce((a, r) => a + (r.totalLpa || 0), 0);
  const top = scoped.reduce((best, r) => (r.lpa > (best?.lpa ?? -1) ? r : best), null);

  // Repeat drives are separate rows ("Flextrade 2", "Amazon (Contractual Basis)"),
  // so distinct employers is smaller than the drive count.
  const employers = new Set(
    scoped.map((r) => String(r.company).replace(/\s*(\d+|\(.*?\))\s*$/, "").trim().toLowerCase())
  ).size;

  const branches = key ? null : BRANCHES.map(({ key, label, short }) => {
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

  const pgCount = key ? 0 : rows.reduce((a, r) => a + pgOf(r), 0);

  const bands = BANDS.map(({ label, lo, hi }) => {
    const count = scoped
      .filter((r) => r.lpa >= lo && r.lpa < hi)
      .reduce((a, r) => a + countOf(r), 0);
    return { label, offers: count, share: offers ? round1((count / offers) * 100) : 0 };
  });

  const groupOf = (g) => {
    const sub = scoped.filter((r) => r.group === g);
    const n = sub.reduce((a, r) => a + countOf(r), 0);
    const s = key
      ? sub.reduce((a, r) => a + countOf(r) * (r.lpa || 0), 0)
      : sub.reduce((a, r) => a + (r.totalLpa || 0), 0);
    return { drives: sub.length, offers: n, avgLpa: n ? round2(s / n) : 0 };
  };

  const male = rows.reduce((a, r) => a + (r.male || 0), 0);
  const female = rows.reduce((a, r) => a + (r.female || 0), 0);

  const rank = (compare) => [...scoped].sort(compare).slice(0, 12).map((r) => ({
    company: r.company,
    total: countOf(r),
    lpa: r.lpa,
  }));
  const byHeadcount = rank((a, b) => countOf(b) - countOf(a) || b.lpa - a.lpa);
  const byPackage = rank((a, b) => b.lpa - a.lpa || countOf(b) - countOf(a));

  return {
    branch: key,
    headline: {
      offers,
      drives: scoped.length,
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
    // The source prints male/female per drive, never per branch, so a branch
    // view has no gender split to show rather than a made-up one.
    gender: key
      ? null
      : {
        male,
        female,
        femaleShare: offers ? round1((female / offers) * 100) : 0,
      },
    topByHeadcount: byHeadcount,
    topByPackage: byPackage,
    incompleteRows: scoped.filter((r) => r.sourceIncomplete).map((r) => ({ sr: r.sr, company: r.company })),
  };
}
