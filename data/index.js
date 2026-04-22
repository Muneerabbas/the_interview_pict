import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TARGET_COLLEGE = "SCTRS PUNE INSTITUTE OF COMPUTER TECHNOLOGY";

const SOURCE_COLLEGES = [
  "Pune Institute of Computer Technology (PICT)",
  "PUNE INSTITUTE OF COMPUTER TECHNOLOGY (PICT)",
  "Pune Institute of Computer Technology",
  "PUNE INSTITUTE OF COMPUTER TECHNOLOGY",
  "PICT",
  "SCTR'S PUNE INSTITUTE OF COMPUTER TECHNOLOGY",
  "SCTR’S PUNE INSTITUTE OF COMPUTER TECHNOLOGY",
  "SCTRs Pune Institute of Computer Technology",
  "SCTRS PUNE INSTITUTE OF COMPUTER TECHNOLOGY",
];

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

async function main() {
  loadEnvFiles();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in ../.env.local or ../.env");
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const dbName = process.env.MONGODB_DB_NAME || "int-exp";
    const experience = client.db(dbName).collection("experience");

    const filter = {
      college: { $in: SOURCE_COLLEGES },
    };

    const beforeCount = await experience.countDocuments(filter);
    console.log(`Matching experience docs before update: ${beforeCount}`);

    const result = await experience.updateMany(filter, {
      $set: { college: TARGET_COLLEGE },
    });

    console.log(`Matched: ${result.matchedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);
    console.log(`Updated college name to: ${TARGET_COLLEGE}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
