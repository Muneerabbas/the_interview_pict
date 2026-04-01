#!/usr/bin/env node
/**
 * Seeds MongoDB Company docs from data/post-companies.json (same list as post dropdown).
 * For each company: about (Wikipedia / DuckDuckGo), logo URL (Wikipedia thumb / DDG), website (Wikidata P856 official site).
 *
 * Usage:
 *   npm run seed:companies
 *   node scripts/seed-post-companies.mjs --limit=20
 *   node scripts/seed-post-companies.mjs --force
 *   node scripts/seed-post-companies.mjs --dry-run --limit=3
 *
 * Loads MONGODB_URI from .env.local or .env (--dry-run does not need DB).
 */

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { companySlugFromName } from "../lib/companySlug.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const UA =
  "theInterview-pict-company-seed/1.0 (contact: site-admin; educational)";

function loadEnvFiles() {
  for (const f of [".env.local", ".env"]) {
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    const content = readFileSync(p, "utf8");
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
    break;
  }
}

loadEnvFiles();

function parseArgs() {
  const out = { limit: null, force: false, dryRun: false };
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--limit=")) out.limit = parseInt(a.slice(8), 10);
    else if (a === "--force") out.force = true;
    else if (a === "--dry-run") out.dryRun = true;
  }
  return out;
}

function dedupeBySlug(names) {
  const seen = new Set();
  const list = [];
  for (const name of names) {
    const slug = companySlugFromName(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    list.push(name);
  }
  return list;
}

function searchVariants(name) {
  const stripped = name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const noPending = stripped.replace(/\s*\(Pending\)\s*/gi, "").trim();
  return [...new Set([name, stripped, noPending, noPending.replace(/&/g, "and")].filter(Boolean))];
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function wikipediaSearch(term) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&format=json&srlimit=5`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.query?.search || []).map((s) => s.title);
}

async function wikipediaSummary(title) {
  const path = title.replace(/ /g, "_");
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(path)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const j = await res.json();
  if (j.type === "disambiguation" || j.type === "not_found") return null;
  const extract = j.extract || "";
  if (!extract || extract.length < 35) return null;
  return {
    extract,
    thumbnail: j.thumbnail?.source || null,
    title,
  };
}

async function wikipediaWikibaseId(pageTitle) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageprops&ppprop=wikibase_item&format=json&redirects=1`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  if (page?.missing) return null;
  return page.pageprops?.wikibase_item || null;
}

async function wikidataOfficialWebsite(qid) {
  if (!qid || !/^Q\d+$/i.test(qid)) return null;
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const data = await res.json();
  const entity = data.entities?.[qid];
  const claims = entity?.claims?.P856;
  if (!claims?.length) return null;
  for (const c of claims) {
    const v = c.mainsnak?.datavalue?.value;
    if (typeof v === "string" && /^https?:\/\//i.test(v)) return v;
  }
  return null;
}

async function duckDuckGo(name) {
  const q = `${name} company`;
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return { abstract: "", image: "" };
  const j = await res.json();
  return {
    abstract: j.AbstractText || j.Abstract || "",
    image: j.Image && /^https?:\/\//i.test(j.Image) ? j.Image : "",
  };
}

async function enrichFromWeb(displayName) {
  let about = "";
  let logo = "";
  let website = "";
  let wikiTitle = null;

  const variants = searchVariants(displayName);

  for (const term of variants) {
    const titles = await wikipediaSearch(term);
    await sleep(180);
    for (const title of titles.slice(0, 4)) {
      const sum = await wikipediaSummary(title);
      await sleep(120);
      if (sum?.extract) {
        about = sum.extract;
        logo = sum.thumbnail || logo;
        wikiTitle = sum.title || title;
        break;
      }
    }
    if (about) break;
  }

  if (wikiTitle) {
    const qid = await wikipediaWikibaseId(wikiTitle);
    await sleep(120);
    if (qid) {
      const official = await wikidataOfficialWebsite(qid);
      if (official) website = official;
    }
  }

  if (!about || about.length < 50) {
    const ddg = await duckDuckGo(variants[0] || displayName);
    await sleep(180);
    if (ddg.abstract && ddg.abstract.length > (about?.length || 0)) {
      about = ddg.abstract;
    }
    if (!logo && ddg.image) logo = ddg.image;
  }

  if (!about) {
    about = `${displayName} is listed in the interview post directory. Add a richer description from the company’s official site when you can.`;
  }

  about = about.replace(/\s+/g, " ").trim();
  if (about.length > 2000) about = about.slice(0, 1997) + "...";

  return { about, logo: logo || "", website: website || "" };
}

const DEFAULT_TAGS = ["Interview", "Campus"];

async function main() {
  const { limit, force, dryRun } = parseArgs();

  if (!dryRun && !process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Add it to .env.local");
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(join(ROOT, "data/post-companies.json"), "utf8"));
  let names = dedupeBySlug(raw);
  if (Number.isFinite(limit) && limit > 0) names = names.slice(0, limit);

  console.log(
    `Companies to process: ${names.length} (from ${raw.length} dropdown entries, deduped by slug)${dryRun ? " [dry-run]" : ""}`
  );

  const connectToDatabase = (await import("../lib/mongoose.js")).default;
  const Company = (await import("../models/Company.js")).default;

  if (!dryRun) await connectToDatabase();

  let inserted = 0;
  let skipped = 0;
  let updated = 0;

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const slug = companySlugFromName(name);
    process.stdout.write(`[${i + 1}/${names.length}] ${name}... `);

    let existing = null;
    if (!dryRun) {
      existing = await Company.findOne({ slug });
      if (existing && !force) {
        console.log("skip (exists)");
        skipped++;
        continue;
      }
    }

    let data;
    try {
      data = await enrichFromWeb(name);
    } catch (e) {
      console.log("enrich error:", e.message);
      data = {
        about: `${name} — listed on the post form. Could not fetch details automatically.`,
        logo: "",
        website: "",
      };
    }

    if (dryRun) {
      console.log(`ok (web=${data.website ? "yes" : "no"} logo=${data.logo ? "yes" : "no"})`);
      continue;
    }

    const doc = {
      name,
      slug,
      about: data.about,
      logo: data.logo || undefined,
      website: data.website || undefined,
      location: undefined,
      tags: DEFAULT_TAGS,
    };

    if (existing && force) {
      await Company.updateOne(
        { slug },
        {
          $set: {
            about: doc.about,
            logo: doc.logo || "",
            website: doc.website || "",
            tags: doc.tags,
          },
        }
      );
      console.log("updated");
      updated++;
    } else {
      await Company.create(doc);
      console.log("inserted");
      inserted++;
    }

    await sleep(280);
  }

  console.log(`Done. inserted=${inserted} updated=${updated} skipped=${skipped}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
