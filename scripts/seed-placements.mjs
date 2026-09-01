#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";

import { companySlugFromName } from "../lib/companySlug.js";
import { checkInvariants, summarise } from "../lib/placement-stats.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Every year the repo has a dataset for. Newest first; the page defaults to the
// first entry. Adding a year is a data file plus one line here.
const YEARS = [
  "2025-26", "2023-24", "2022-23", "2021-22", "2020-21", "2019-20", "2018-19", "2017-18",
];
const cacheKey = (year) => `placements_${year.replace("-", "_")}`;

function loadEnvFiles() {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = join(ROOT, fileName);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;

      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
    break;
  }
}

function parseArgs() {
  return {
    dryRun: process.argv.includes("--dry-run"),
  };
}

function buildPlacementDocs(raw, year) {
  return raw.map((row) => ({
    year: row.year || year,
    sr: Number(row.sr),
    variant: String(row.variant || ""),
    company: String(row.company || "").trim(),
    slug: companySlugFromName(row.company),
    group: row.group,
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
    genderMismatch: Boolean(row.genderMismatch),
    branchMismatch: Boolean(row.branchMismatch),
    salaryBand: Boolean(row.salaryBand),
    ...(row.shifts ? { shifts: row.shifts } : {}),
  }));
}

/**
 * The whole /placements page is downstream of this file, so it is the trust
 * boundary: a dataset that fails any arithmetic check must never reach Mongo,
 * where it would quietly render wrong numbers to every visitor.
 */
function validate(docs) {
  const problems = checkInvariants(docs);

  for (const doc of docs) {
    if (!doc.company) problems.push(`sr ${doc.sr}: empty company name`);
    if (!doc.slug) problems.push(`sr ${doc.sr}: slug did not generate`);
    if (!["I", "II"].includes(doc.group)) problems.push(`sr ${doc.sr}: bad group "${doc.group}"`);
    // A zero package is only valid on a zero-headcount row: the reports list a
    // few companies that visited and placed nobody.
    if (doc.total > 0 && !(doc.lpa > 0)) {
      problems.push(`sr ${doc.sr}: non-positive package ${doc.lpa} on ${doc.total} offers`);
    }
    if (doc.total < 0 || doc.lpa < 0) problems.push(`sr ${doc.sr}: negative values`);
  }

  const keys = new Set();
  for (const doc of docs) {
    const key = `${doc.year}:${doc.group}:${doc.sr}:${doc.variant}`;
    if (keys.has(key)) problems.push(`duplicate natural key ${key}`);
    keys.add(key);
  }

  return problems;
}

async function clearPlacementCache(keys) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    const redis = new Redis({
      url,
      token,
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    });
    await Promise.all(keys.map((key) => redis.del(key)));
    console.log(`Cleared ${keys.length} cache key(s).`);
  } catch (error) {
    console.warn("Could not clear placement caches:", error?.message || error);
  }
}

async function main() {
  loadEnvFiles();
  const { dryRun } = parseArgs();

  if (!dryRun && !process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Add it to .env.local or .env");
    process.exit(1);
  }

  // Parse and validate every year up front. One bad file aborts the whole run
  // rather than leaving the collection half-updated.
  const byYear = [];
  for (const year of YEARS) {
    const path = join(ROOT, `data/pict-placements-${year}.json`);
    if (!existsSync(path)) {
      console.error(`Missing dataset for ${year}: ${path}`);
      process.exit(1);
    }
    const docs = buildPlacementDocs(JSON.parse(readFileSync(path, "utf8")), year);
    const problems = validate(docs);
    if (problems.length) {
      console.error(`Refusing to seed -- ${problems.length} problem(s) in ${year}:`);
      for (const problem of problems.slice(0, 12)) console.error(`  - ${problem}`);
      if (problems.length > 12) console.error(`  ... and ${problems.length - 12} more`);
      process.exit(1);
    }
    byYear.push({ year, docs, stats: summarise(docs) });
  }

  console.log(`Prepared ${YEARS.length} years:`);
  console.table(
    byYear.map(({ year, docs, stats }) => ({
      year,
      drives: docs.length,
      offers: stats.headline.offers,
      employers: stats.headline.employers,
      mean: stats.headline.meanLpa,
      median: stats.headline.medianLpa,
      highest: stats.headline.maxLpa,
      flagged: docs.filter((d) => d.genderMismatch || d.branchMismatch || d.salaryBand || d.sourceIncomplete).length,
    }))
  );

  if (dryRun) {
    console.log("Dry run: nothing written.");
    return;
  }

  // Imported here on purpose: lib/mongoose.js throws at module load without
  // MONGODB_URI, which would break --dry-run on a machine with no env file.
  const connectToDatabase = (await import("../lib/mongoose.js")).default;
  const Placement = (await import("../models/Placement.js")).default;

  await connectToDatabase();

  let inserted = 0;
  let updated = 0;
  for (const { year, docs } of byYear) {
    // Upsert rather than deleteMany + insertMany: an interrupted run must never
    // leave the collection empty and the page blank. The filter carries group
    // and variant because Sr. No. alone repeats within a year.
    const ops = docs.map((doc) => ({
      updateOne: {
        filter: { year: doc.year, group: doc.group, sr: doc.sr, variant: doc.variant },
        update: { $set: doc },
        upsert: true,
      },
    }));
    const result = await Placement.bulkWrite(ops, { ordered: false });

    // Count what actually landed. A collapsing natural key shows up here as a
    // short count long before anyone notices the page is missing companies.
    const stored = await Placement.countDocuments({ year });
    if (stored !== docs.length) {
      console.error(
        `Seed verification failed for ${year}: wrote ${docs.length} drives but ${stored} are stored.`
      );
      process.exit(1);
    }
    inserted += result.upsertedCount || 0;
    updated += result.modifiedCount || 0;
    console.log(`  ${year}: ${stored} drives stored.`);
  }

  await clearPlacementCache(YEARS.map(cacheKey));
  console.log(`Seeded placements: ${inserted} inserted, ${updated} updated across ${YEARS.length} years.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
