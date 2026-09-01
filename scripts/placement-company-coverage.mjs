#!/usr/bin/env node

/**
 * Which placement employers already have a page in the companies directory, and
 * which do not. Read-only -- it never writes. Run it after seeding a new year to
 * see what is worth adding to the directory next.
 *
 *   node scripts/placement-company-coverage.mjs            summary + top gaps
 *   node scripts/placement-company-coverage.mjs --all      every missing company
 *   node scripts/placement-company-coverage.mjs --json     machine-readable
 *   node scripts/placement-company-coverage.mjs --year=2025-26
 */

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  buildCompanyIndex,
  resolveCompanySlug,
  placementCompanySlug,
} from "../lib/company-link.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

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
  const yearArg = process.argv.find((a) => a.startsWith("--year="));
  return {
    all: process.argv.includes("--all"),
    json: process.argv.includes("--json"),
    year: yearArg ? yearArg.slice("--year=".length) : null,
  };
}

async function main() {
  loadEnvFiles();
  const { all, json, year } = parseArgs();

  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Add it to .env.local or .env");
    process.exit(1);
  }

  const { getMongoDb } = await import("../lib/mongodb.js");
  const db = await getMongoDb({ mode: "read" });

  const companies = await db
    .collection("companies")
    .find({}, { projection: { _id: 0, name: 1, slug: 1 } })
    .toArray();
  const index = buildCompanyIndex(companies);

  const filter = year ? { year } : {};
  const placements = await db
    .collection("placements")
    .find(filter, { projection: { _id: 0, company: 1, total: 1, lpa: 1, year: 1 } })
    .toArray();

  if (!placements.length) {
    console.error(year ? `No placement rows for ${year}.` : "No placement rows found.");
    process.exit(1);
  }

  // One entry per employer, collapsing repeat drives ("Flextrade 2") and role
  // splits ("eQ Technologic (SDE)") onto the same company.
  const byCompany = new Map();
  for (const row of placements) {
    const key = placementCompanySlug(row.company);
    if (!key) continue;
    if (!byCompany.has(key)) {
      byCompany.set(key, {
        key,
        name: row.company,
        offers: 0,
        drives: 0,
        years: new Set(),
        topLpa: 0,
        slug: resolveCompanySlug(row.company, index),
      });
    }
    const entry = byCompany.get(key);
    entry.offers += row.total || 0;
    entry.drives += 1;
    entry.years.add(row.year);
    entry.topLpa = Math.max(entry.topLpa, row.lpa || 0);
  }

  const entries = [...byCompany.values()].sort(
    (a, b) => b.offers - a.offers || a.name.localeCompare(b.name)
  );
  const missing = entries.filter((e) => !e.slug);
  const linked = entries.length - missing.length;
  const offersTotal = entries.reduce((a, e) => a + e.offers, 0);
  const offersMissing = missing.reduce((a, e) => a + e.offers, 0);

  if (json) {
    console.log(
      JSON.stringify(
        {
          scope: year || "all years",
          companies: entries.length,
          linked,
          missing: missing.length,
          offersTotal,
          offersMissing,
          missingCompanies: missing.map((e) => ({
            name: e.name,
            slug: e.key,
            offers: e.offers,
            drives: e.drives,
            topLpa: e.topLpa,
            years: [...e.years].sort(),
          })),
        },
        null,
        2
      )
    );
    return;
  }

  console.log(`Placement company coverage (${year || "all years"})`);
  console.log(
    `  ${entries.length} distinct employers - ${linked} have a company page, ${missing.length} do not.`
  );
  console.log(
    `  Offers covered: ${offersTotal - offersMissing}/${offersTotal} ` +
      `(${((100 * (offersTotal - offersMissing)) / offersTotal).toFixed(1)}%)\n`
  );

  const show = all ? missing : missing.slice(0, 30);
  if (!show.length) {
    console.log("Every placement employer has a company page.");
    return;
  }
  console.log(`Missing from the companies directory${all ? "" : " (top 30 by offers)"}:`);
  console.table(
    show.map((e) => ({
      company: e.name,
      slug: e.key,
      offers: e.offers,
      drives: e.drives,
      topLpa: e.topLpa,
      years: [...e.years].sort().join(", "),
    }))
  );
  if (!all && missing.length > show.length) {
    console.log(`... and ${missing.length - show.length} more. Re-run with --all.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
