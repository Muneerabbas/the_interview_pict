#!/usr/bin/env node
/**
 * One-off migration: re-slug company documents with lib/companySlug.js.
 *
 * /api/saveExp used to auto-create companies with slugify(name, {strict:true})
 * while every link in the UI is built with companySlugFromName(). The two disagree
 * wherever a name contains "&" -- slugify expands it ("L&T" -> "landt"), we strip
 * it ("lt") -- so those company pages 404 from the cards that link to them.
 *
 * Usage:
 *   node scripts/fix-company-slugs.mjs --dry-run
 *   node scripts/fix-company-slugs.mjs
 */

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { companySlugFromName } from "../lib/companySlug.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");

for (const file of [".env.local", ".env"]) {
  const path = join(ROOT, file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "int-exp");
  const companies = db.collection("companies");

  const docs = await companies.find({}, { projection: { name: 1, slug: 1 } }).toArray();
  const taken = new Set(docs.map((doc) => doc.slug).filter(Boolean));

  let fixed = 0;
  let skipped = 0;

  for (const doc of docs) {
    const wanted = companySlugFromName(doc.name);
    if (!wanted || wanted === doc.slug) continue;

    if (taken.has(wanted)) {
      // Another company already owns the correct slug -- almost always the
      // case-duplicate pair (Cutshort / CutShort). Leave it for a human.
      console.warn(`skip  ${doc.name}: "${wanted}" is already taken`);
      skipped += 1;
      continue;
    }

    console.log(`${dryRun ? "would fix" : "fix"}  ${doc.name}: ${doc.slug} -> ${wanted}`);
    if (!dryRun) {
      await companies.updateOne({ _id: doc._id }, { $set: { slug: wanted } });
      taken.delete(doc.slug);
      taken.add(wanted);
    }
    fixed += 1;
  }

  console.log(`\n${docs.length} companies, ${fixed} ${dryRun ? "would be " : ""}re-slugged, ${skipped} skipped.`);
} finally {
  await client.close();
}
