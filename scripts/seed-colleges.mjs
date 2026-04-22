#!/usr/bin/env node

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";

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
  };
}

function buildCollegeDocs(raw) {
  const byName = new Map();

  for (const [stateCode, colleges] of Object.entries(raw)) {
    for (const collegeName of colleges) {
      const name = String(collegeName || "").trim();
      if (!name) continue;

      if (!byName.has(name)) {
        byName.set(name, {
          name,
          stateCodes: [stateCode],
        });
        continue;
      }

      const existing = byName.get(name);
      if (!existing.stateCodes.includes(stateCode)) {
        existing.stateCodes.push(stateCode);
      }
    }
  }

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function clearCollegeCache() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    const redis = new Redis({
      url,
      token,
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    });
    await redis.del("dropdown_colleges");
  } catch (error) {
    console.warn("Failed to clear dropdown_colleges cache:", error.message);
  }
}

async function main() {
  loadEnvFiles();

  const { dryRun } = parseArgs();
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Add it to .env.local or .env");
    process.exit(1);
  }

  const raw = JSON.parse(
    readFileSync(join(ROOT, "data/indian_college_list.json"), "utf8")
  );
  const collegeDocs = buildCollegeDocs(raw);

  console.log(`Prepared ${collegeDocs.length} unique colleges${dryRun ? " [dry-run]" : ""}`);
  console.log("Sample:", collegeDocs.slice(0, 5).map((college) => college.name));

  if (dryRun) return;

  const connectToDatabase = (await import("../lib/mongoose.js")).default;
  const College = (await import("../models/College.js")).default;

  await connectToDatabase();
  await College.deleteMany({});
  await College.insertMany(collegeDocs, { ordered: false });
  await clearCollegeCache();

  console.log(`Replaced colleges collection with ${collegeDocs.length} documents.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
