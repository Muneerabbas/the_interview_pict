#!/usr/bin/env node

/**
 * Adds directory pages for the highest-volume placement recruiters that had
 * none. Content in data/placement-companies.json is hand-written from research,
 * not generated -- an invented "about" on a company page is worse than no page.
 *
 * Logos are deliberately optional: the company page falls back to an initial
 * tile, and a broken <img> looks worse than that fallback. Pass --logos to try
 * Google's favicon service and keep only the URLs that return a real image.
 *
 *   node scripts/seed-placement-companies.mjs --dry-run
 *   node scripts/seed-placement-companies.mjs --logos
 */

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";

import { companySlugFromName } from "../lib/companySlug.js";

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
  return {
    dryRun: process.argv.includes("--dry-run"),
    logos: process.argv.includes("--logos"),
    force: process.argv.includes("--force"),
  };
}

function validate(docs) {
  const problems = [];
  const slugs = new Set();
  for (const doc of docs) {
    if (!doc.name) problems.push("a record has no name");
    if (!doc.about || doc.about.length < 40) {
      problems.push(`${doc.name}: about is missing or too thin`);
    }
    if (doc.slug !== companySlugFromName(doc.name) && !doc.slug) {
      problems.push(`${doc.name}: slug missing`);
    }
    if (slugs.has(doc.slug)) problems.push(`duplicate slug ${doc.slug}`);
    slugs.add(doc.slug);
    if (doc.website && !/^https:\/\//.test(doc.website)) {
      problems.push(`${doc.name}: website must be https`);
    }
  }
  return problems;
}

/** Only keep a favicon URL that actually returns an image of usable size. */
async function resolveLogo(website) {
  if (!website) return "";
  let domain;
  try {
    domain = new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
  const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return "";
    const buf = Buffer.from(await res.arrayBuffer());
    // A generic globe placeholder comes back tiny; a real logo does not.
    if (buf.length < 800) return "";
    if (!(res.headers.get("content-type") || "").startsWith("image/")) return "";
    return url;
  } catch {
    return "";
  }
}

async function main() {
  loadEnvFiles();
  const { dryRun, logos, force } = parseArgs();

  if (!dryRun && !process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Add it to .env.local or .env");
    process.exit(1);
  }

  const raw = JSON.parse(
    readFileSync(join(ROOT, "data/placement-companies.json"), "utf8")
  );
  const docs = raw.map((c) => ({
    name: c.name,
    slug: c.slug || companySlugFromName(c.name),
    about: c.about,
    website: c.website || "",
    logo: "",
    location: c.location || "",
    tags: Array.isArray(c.tags) ? c.tags : [],
  }));

  const problems = validate(docs);
  if (problems.length) {
    console.error(`Refusing to seed -- ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  if (logos) {
    process.stdout.write("Resolving logos ");
    for (const doc of docs) {
      doc.logo = await resolveLogo(doc.website);
      process.stdout.write(doc.logo ? "." : "x");
    }
    console.log(` -> ${docs.filter((d) => d.logo).length}/${docs.length} resolved`);
  }

  console.log(`Prepared ${docs.length} company pages:`);
  console.table(
    docs.map((d) => ({ name: d.name, slug: d.slug, location: d.location, logo: d.logo ? "yes" : "-" }))
  );

  if (dryRun) {
    console.log("Dry run: nothing written.");
    return;
  }

  const connectToDatabase = (await import("../lib/mongoose.js")).default;
  const Company = (await import("../models/Company.js")).default;
  await connectToDatabase();

  let created = 0;
  let updated = 0;
  let skipped = 0;
  for (const doc of docs) {
    const existing = await Company.findOne({ slug: doc.slug }).lean();
    if (existing && !force) {
      // Never clobber a page someone has already written by hand.
      skipped += 1;
      console.log(`  skip    ${doc.name} (already exists)`);
      continue;
    }
    if (existing) {
      await Company.updateOne({ slug: doc.slug }, { $set: doc });
      updated += 1;
      console.log(`  update  ${doc.name}`);
    } else {
      await Company.create(doc);
      created += 1;
      console.log(`  create  ${doc.name}`);
    }
  }

  // The placements page caches the company index, and /api/getCompanies caches
  // the dropdown; both are stale the moment a company is added.
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const redis = new Redis({
        url,
        token,
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      });
      await Promise.all([
        redis.del("placements_company_index"),
        redis.del("dropdown_companies_v2"),
      ]);
      console.log("Cleared company caches.");
    } catch (error) {
      console.warn("Could not clear company caches:", error?.message || error);
    }
  }

  console.log(`Done: ${created} created, ${updated} updated, ${skipped} skipped.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
