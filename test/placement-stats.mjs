import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { summarise, checkInvariants, median } from "../lib/placement-stats.js";
import { normalizeHost, isPlacementHost } from "../lib/host-gate.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const rows = JSON.parse(readFileSync(join(ROOT, "data/pict-placements-2025-26.json"), "utf8"));

// Averages are money; compare with a tolerance rather than ===.
function closeTo(actual, expected, tolerance = 0.005, message = "") {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message} expected ${expected}, got ${actual}`
  );
}

// --- dataset integrity -------------------------------------------------------
// These are the checks that validated the transcription against the printed
// report. If a future edit breaks one, the seeder refuses to write and this
// fails first.
assert.deepEqual(checkInvariants(rows), [], "dataset must satisfy every arithmetic invariant");
assert.equal(rows.length, 110, "2025-26 has 110 recruiting drives");

const stats = summarise(rows);

assert.equal(stats.headline.offers, 591, "total offers");
assert.equal(stats.headline.drives, 110, "total drives");
assert.equal(stats.headline.employers, 100, "distinct employers after collapsing repeat drives");

// --- headline packages -------------------------------------------------------
closeTo(stats.headline.meanLpa, 12.0, 0.005, "mean package:");
closeTo(stats.headline.medianLpa, 11.13, 0.005, "median package:");
closeTo(stats.headline.maxLpa, 53.35, 0.005, "highest package:");
closeTo(stats.headline.minLpa, 3.62, 0.005, "lowest package:");
assert.equal(stats.headline.maxCompany, "Adobe", "highest package is Adobe");

// --- branch split ------------------------------------------------------------
const [ce, entc, it] = stats.branches;
assert.equal(ce.offers, 268, "CE offers");
assert.equal(entc.offers, 136, "E&TC offers");
assert.equal(it.offers, 183, "IT offers");
assert.equal(stats.postgrad.offers, 4, "M.Tech offers");
assert.equal(
  ce.offers + entc.offers + it.offers + stats.postgrad.offers,
  591,
  "branch counts must account for every offer"
);

// The whole point of the page's footnote: derived branch averages differ from
// the ones the report printed, because row 106 (SLB) has blank salary cells.
closeTo(ce.avgLpa, 13.06, 0.005, "corrected CE average:");
closeTo(it.avgLpa, 12.3, 0.005, "corrected IT average:");
closeTo(entc.avgLpa, 9.46, 0.005, "E&TC average:");
closeTo(ce.printedAvgLpa, 12.99, 0.005, "printed CE average:");
closeTo(it.printedAvgLpa, 12.25, 0.005, "printed IT average:");
closeTo(entc.printedAvgLpa, 9.46, 0.005, "E&TC is unaffected by the SLB gap:");

closeTo(entc.medianLpa, 8.0, 0.005, "E&TC median:");
// 268 CE offers is an even count, so this is the mean of the middle pair, not
// the naive middle index (which would read 13.00).
closeTo(ce.medianLpa, 12.75, 0.005, "CE median:");

// --- the source defect -------------------------------------------------------
assert.equal(stats.incompleteRows.length, 1, "exactly one row has blank source salary cells");
assert.equal(stats.incompleteRows[0].sr, 106, "the incomplete row is sr 106");
assert.equal(stats.incompleteRows[0].company, "SLB", "the incomplete row is SLB");

// --- groups and gender -------------------------------------------------------
assert.equal(stats.groups.I.drives, 106, "Group I drives");
assert.equal(stats.groups.I.offers, 558, "Group I offers");
closeTo(stats.groups.I.avgLpa, 12.47, 0.005, "Group I average:");
assert.equal(stats.groups.II.drives, 4, "Group II drives");
assert.equal(stats.groups.II.offers, 33, "Group II offers");
closeTo(stats.groups.II.avgLpa, 4.08, 0.005, "Group II average:");

assert.equal(stats.gender.male, 420, "male offers");
assert.equal(stats.gender.female, 171, "female offers");
assert.equal(stats.gender.male + stats.gender.female, 591, "gender split must cover every offer");

// --- band distribution -------------------------------------------------------
assert.equal(
  stats.bands.reduce((a, b) => a + b.offers, 0),
  591,
  "every offer must land in exactly one band"
);

// --- median helper -----------------------------------------------------------
assert.equal(median([3, 1, 2]), 2, "odd length takes the middle value");
assert.equal(median([1, 2, 3, 4]), 2.5, "even length averages the middle pair");
assert.equal(median([]), 0, "empty input must not NaN the page");

// --- host gate ---------------------------------------------------------------
assert.equal(normalizeHost("WWW.Pict.Live:3000"), "pict.live", "normalises case, www and port");
assert.equal(normalizeHost("[::1]:3000"), "[::1]", "keeps an IPv6 literal intact");
assert.equal(normalizeHost(undefined), "", "missing header is not a host");

assert.equal(isPlacementHost("pict.live"), true);
assert.equal(isPlacementHost("www.pict.live"), true);
assert.equal(isPlacementHost("PICT.LIVE:3000"), true);
assert.equal(isPlacementHost("pict.live, other.host"), true, "takes the first forwarded host");
// The one that matters: substring matching here would open the gate to anyone.
assert.equal(isPlacementHost("pict.live.evil.com"), false, "suffix attack must not pass");
assert.equal(isPlacementHost("evil-pict.live"), false, "prefix attack must not pass");
assert.equal(isPlacementHost("theinterviewroom.in"), false);
assert.equal(isPlacementHost("www.theinterviewroom.in"), false);
assert.equal(isPlacementHost(""), false);
assert.equal(isPlacementHost("localhost:3000", { allowDev: true }), true, "dev bypass works locally");
assert.equal(
  isPlacementHost("localhost:3000", { allowDev: false }),
  false,
  "dev bypass must be closed in production"
);


// --- every other year reconciles against its own printed totals ---------------
// These expectations come from each report's own "Total count of Students
// Placed" and "Overall Avg. Sal." rows -- not from my parse. That is what makes
// them a real check: a transcription slip breaks the equality.
const YEARS = {
  "2017-18": { drives: 64, offers: 412, mean: 6.24, cols: [139 + 45, 96 + 30, 95] },
  "2018-19": { drives: 98, offers: 530, mean: 6.45, cols: [188 + 51, 145 + 35, 104] },
  "2019-20": { drives: 120, offers: 554, mean: 7.6, cols: [198 + 55, 139 + 39, 122] },
  "2020-21": { drives: 148, offers: 662, mean: 7.15, cols: [213 + 56, 153 + 49, 190] },
  // The 2021-22 report's own branch columns sum to 670 against its printed
  // total of 672 -- a defect in the source, reproduced faithfully here.
  "2021-22": { drives: 118, offers: 672, mean: 11.09, cols: [191 + 54, 176 + 61, 186], branchShort: 2 },
  "2022-23": { drives: 113, offers: 706, mean: 12.11, cols: [213 + 59, 171 + 53, 210] },
  // Seven 2023-24 rows print male + female one or two short of their own total;
  // the year is three offers light on the gender split as a result.
  "2023-24": { drives: 111, offers: 668, mean: 10.11, cols: [227 + 60, 151 + 48, 182], genderDiff: -3 },
};

for (const [year, exp] of Object.entries(YEARS)) {
  const yearRows = JSON.parse(
    readFileSync(join(ROOT, `data/pict-placements-${year}.json`), "utf8")
  );
  assert.deepEqual(checkInvariants(yearRows), [], `${year}: arithmetic invariants`);
  assert.equal(yearRows.length, exp.drives, `${year}: drive count`);

  const s = summarise(yearRows);
  assert.equal(s.headline.offers, exp.offers, `${year}: total offers vs printed`);
  closeTo(s.headline.meanLpa, exp.mean, 0.005, `${year}: overall average vs printed:`);
  assert.equal(
    yearRows.reduce((a, r) => a + r.male + r.female, 0),
    exp.offers + (exp.genderDiff || 0),
    `${year}: gender split vs total (source discrepancy pinned)`
  );
  assert.deepEqual(
    s.branches.map((b) => b.offers),
    exp.cols,
    `${year}: CE / E&TC / IT counts vs printed (shift columns summed)`
  );
  assert.equal(
    s.branches.reduce((a, b) => a + b.offers, 0) + s.postgrad.offers,
    exp.offers - (exp.branchShort || 0),
    `${year}: branch counts must account for every offer (minus the source's own shortfall)`
  );
}

console.log(`placement-stats: passed (${Object.keys(YEARS).length + 1} years verified)`);
