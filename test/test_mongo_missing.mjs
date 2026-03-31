import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "int-exp";
  const client = new MongoClient(uri);
  await client.connect();
  const experience = client.db(dbName).collection("experience");
  
  const total = await experience.countDocuments();
  const missingDate = await experience.countDocuments({ date: { $exists: false } });
  const missingId = await experience.countDocuments({ _id: { $exists: false } });
  
  console.log("Total:", total);
  console.log("Missing date:", missingDate);
  console.log("Missing _id:", missingId);
  
  const dates = await experience.find({}, { projection: { date: 1 } }).toArray();
  const invalidDates = dates.filter(d => typeof d.date !== 'string' || Number.isNaN(Date.parse(d.date)));
  console.log("Invalid dates count:", invalidDates.length);
  if (invalidDates.length > 0) {
    console.log("First invalid:", invalidDates[0]);
  }

  await client.close();
}
main().catch(console.error);
