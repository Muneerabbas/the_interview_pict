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

    const total = await experience.countDocuments();
    console.log("Total articles:", total);

    const latestByDate = await experience.find().sort({ date: -1 }).limit(10).toArray();
    console.log("Latest by date:-1 :");
    latestByDate.forEach(f => console.log(f.date, "|", f.uid, "|", f.company));

    const latestById = await experience.find().sort({ _id: -1 }).limit(10).toArray();
    console.log("\nLatest by _id:-1 :");
    latestById.forEach(f => console.log(f.date, "|", f._id, "|", f.uid));

    // Let's also check distinct date formats:
    const dates = await experience.find({}, { projection: { date: 1 } }).toArray();
    const types = [...new Set(dates.map(d => typeof d.date))];
    console.log("\nTypes of 'date' field:", types);

    await client.close();
}
main().catch(console.error);
