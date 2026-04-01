import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { MongoClient } from "mongodb";

async function main() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || "int-exp";
    const client = new MongoClient(uri);
    await client.connect();
    const experience = client.db(dbName).collection("experience");

    // page 0
    const page0 = await experience.aggregate([
        { $sort: { date: -1, _id: -1 } },
        { $skip: 0 },
        { $limit: 10 }
    ]).toArray();

    // page 1
    const page1 = await experience.aggregate([
        { $sort: { date: -1, _id: -1 } },
        { $skip: 10 },
        { $limit: 10 }
    ]).toArray();

    console.log("Page 0 IDs:");
    page0.forEach(p => console.log(" ", p._id.toString()));
    console.log("Page 1 IDs:");
    page1.forEach(p => console.log(" ", p._id.toString()));

    const intersection = page0.filter(p0 => page1.some(p1 => p1._id.toString() === p0._id.toString()));
    console.log("Intersection count:", intersection.length);

    await client.close();
}
main().catch(console.error);
