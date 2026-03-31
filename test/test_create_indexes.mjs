import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("No MONGODB_URI found", process.env);
        return;
    }
    const client = new MongoClient(uri);
    await client.connect();
    const dbName = process.env.MONGODB_DB_NAME || "int-exp";
    const experience = client.db(dbName).collection("experience");

    await experience.createIndex({ date: -1, _id: -1 });
    console.log("Index 1 created");

    await experience.createIndex({ views: -1, date: -1, _id: -1 });
    console.log("Index 2 created");

    await experience.createIndex({ company: 1, date: -1, _id: -1 });
    console.log("Index 3 created");

    await client.close();
}
main().catch(console.error);
