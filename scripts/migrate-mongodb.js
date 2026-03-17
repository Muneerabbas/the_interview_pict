import { MongoClient } from "mongodb";

const SOURCE_MONGODB_URI = process.env.SOURCE_MONGODB_URI;
const TARGET_MONGODB_URI = process.env.TARGET_MONGODB_URI;
const SOURCE_DB_NAME = process.env.SOURCE_DB_NAME || "int-exp";
const TARGET_DB_NAME = process.env.TARGET_DB_NAME || process.env.MONGODB_DB_NAME || "int-exp";
const DROP_TARGET = process.env.DROP_TARGET === "true";
const BATCH_SIZE = Number(process.env.MIGRATION_BATCH_SIZE || 500);

const DEFAULT_COLLECTIONS = [
  "experience",
  "backup",
  "drafts",
  "user",
  "newsletter",
  "dropdowns",
];

const requestedCollections = process.env.COLLECTIONS
  ? process.env.COLLECTIONS.split(",").map((value) => value.trim()).filter(Boolean)
  : DEFAULT_COLLECTIONS;

if (!SOURCE_MONGODB_URI || !TARGET_MONGODB_URI) {
  console.error("Missing required env vars: SOURCE_MONGODB_URI and TARGET_MONGODB_URI");
  process.exit(1);
}

async function migrateCollection(sourceDb, targetDb, collectionName) {
  const sourceCollection = sourceDb.collection(collectionName);
  const targetCollection = targetDb.collection(collectionName);

  const estimatedCount = await sourceCollection.estimatedDocumentCount();
  if (estimatedCount === 0) {
    console.log(`- ${collectionName}: no documents found, skipping`);
    return;
  }

  if (DROP_TARGET) {
    await targetCollection.deleteMany({});
  }

  const cursor = sourceCollection.find({});
  let migrated = 0;
  let batch = [];

  for await (const doc of cursor) {
    batch.push(doc);
    if (batch.length < BATCH_SIZE) continue;

    const operations = batch.map((item) => ({
      replaceOne: {
        filter: { _id: item._id },
        replacement: item,
        upsert: true,
      },
    }));

    await targetCollection.bulkWrite(operations, { ordered: false });
    migrated += batch.length;
    batch = [];
    console.log(`- ${collectionName}: migrated ${migrated}/${estimatedCount}`);
  }

  if (batch.length) {
    const operations = batch.map((item) => ({
      replaceOne: {
        filter: { _id: item._id },
        replacement: item,
        upsert: true,
      },
    }));

    await targetCollection.bulkWrite(operations, { ordered: false });
    migrated += batch.length;
    console.log(`- ${collectionName}: migrated ${migrated}/${estimatedCount}`);
  }
}

async function run() {
  const sourceClient = new MongoClient(SOURCE_MONGODB_URI);
  const targetClient = new MongoClient(TARGET_MONGODB_URI);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db(SOURCE_DB_NAME);
    const targetDb = targetClient.db(TARGET_DB_NAME);

    console.log(`Source DB: ${SOURCE_DB_NAME}`);
    console.log(`Target DB: ${TARGET_DB_NAME}`);
    console.log(`Collections: ${requestedCollections.join(", ")}`);
    console.log(`Drop target before write: ${DROP_TARGET ? "yes" : "no"}`);

    for (const collectionName of requestedCollections) {
      await migrateCollection(sourceDb, targetDb, collectionName);
    }

    console.log("Migration completed successfully.");
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
