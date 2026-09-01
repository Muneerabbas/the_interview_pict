#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";

import { companySlugFromName } from "../lib/companySlug.js";
import { checkInvariants, summarise } from "../lib/placement-stats.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const YEAR = "2025-26";
const CACHE_KEY = "placements_2025_26";

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

function buildPlacementDocs(raw) {
  return raw.map((row) => ({
    year: row.year || YEAR,
    sr: Number(row.sr),
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
    if (!(doc.lpa > 0)) problems.push(`sr ${doc.sr}: non-positive package ${doc.lpa}`);
  }

  const keys = new Set();
  for (const doc of docs) {
    const key = `${doc.year}:${doc.sr}:${doc.group}`;
    if (keys.has(key)) problems.push(`duplicate natural key ${key}`);
    keys.add(key);
  }

  return problems;
}

async function clearPlacementCache() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    const redis = new Redis({
      url,
      token,
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    });
    await redis.del(CACHE_KEY);
    console.log(`Cleared cache key ${CACHE_KEY}.`);
  } catch (error) {
    console.warn(`Could not clear ${CACHE_KEY}:`, error?.message || error);
  }
}

async function main() {
  loadEnvFiles();
  const { dryRun } = parseArgs();

  if (!dryRun && !process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Add it to .env.local or .env");
    process.exit(1);
  }

  const raw = JSON.parse(
    readFileSync(join(ROOT, "data/pict-placements-2025-26.json"), "utf8")
  );
  const docs = buildPlacementDocs(raw);

  const problems = validate(docs);
  if (problems.length) {
    console.error(`Refusing to seed -- ${problems.length} problem(s) in the dataset:`);
    for (const problem of problems.slice(0, 20)) console.error(`  - ${problem}`);
    if (problems.length > 20) console.error(`  ... and ${problems.length - 20} more`);
    process.exit(1);
  }

  const stats = summarise(docs);
  console.log(
    `Prepared ${docs.length} placement drives for ${YEAR}: ` +
      `${stats.headline.offers} offers, ${stats.headline.employers} employers, ` +
      `mean ${stats.headline.meanLpa} LPA, median ${stats.headline.medianLpa} LPA.`
  );
  console.log(
    `  CE ${stats.branches[0].offers} - E&TC ${stats.branches[1].offers} - ` +
      `IT ${stats.branches[2].offers} - M.Tech ${stats.postgrad.offers}`
  );
  if (stats.incompleteRows.length) {
    console.log(
      `  Source-incomplete rows: ${stats.incompleteRows
        .map((r) => `sr ${r.sr} (${r.company})`)
        .join(", ")}`
    );
  }
  console.table(docs.slice(0, 5).map(({ sr, company, group, total, lpa }) => ({ sr, company, group, total, lpa })));

  if (dryRun) {
    console.log("Dry run: nothing written.");
    return;
  }

  // Imported here on purpose: lib/mongoose.js throws at module load without
  // MONGODB_URI, which would break --dry-run on a machine with no env file.
  const connectToDatabase = (await import("../lib/mongoose.js")).default;
  const Placement = (await import("../models/Placement.js")).default;

  await connectToDatabase();

  // Upsert rather than deleteMany + insertMany: an interrupted run must never
  // leave the collection empty and the page blank.
  // The filter must include `group`: the report restarts numbering at 1 for
  // Group II, so { year, sr } alone made the four Group II rows overwrite Group
  // I rows 1-4 and silently dropped 48 offers.
  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { year: doc.year, group: doc.group, sr: doc.sr },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const result = await Placement.bulkWrite(ops, { ordered: false });

  // Count what actually landed. A collapsing natural key shows up here as a
  // short count long before anyone notices the page is missing companies.
  const stored = await Placement.countDocuments({ year: YEAR });
  if (stored !== docs.length) {
    console.error(
      `Seed verification failed: wrote ${docs.length} drives but ${stored} are stored. ` +
        `Check the { year, group, sr } uniqueness of the dataset.`
    );
    process.exit(1);
  }

  await clearPlacementCache();

  console.log(
    `Seeded placements: ${result.upsertedCount || 0} inserted, ` +
      `${result.modifiedCount || 0} updated, ${stored} stored (${docs.length} expected).`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
