import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db();
    const experiences = db.collection("experience");

    console.log("Updating existing experiences with content_type: 'interview'...");
    const result = await experiences.updateMany(
      { content_type: { $exists: false } },
      { $set: { content_type: "interview" } }
    );

    console.log(`${result.matchedCount} documents matched the query.`);
    console.log(`${result.modifiedCount} documents were updated.`);

    // Also update backup collection if it exists
    const backup = db.collection("backup");
    await backup.updateMany(
        { content_type: { $exists: false } },
        { $set: { content_type: "interview" } }
    );
    console.log("Backup collection updated as well.");

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
