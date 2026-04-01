import axios from "axios";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "int-exp";
  const client = new MongoClient(uri);
  await client.connect();
  const experience = client.db(dbName).collection("experience");
  
  const pipeline = [
    { $sort: { date: -1, _id: -1 } },
    { $skip: 0 },
    { $limit: 10 },
    {
      $lookup: {
        from: "user",
        localField: "email",
        foreignField: "gmail",
        as: "author_info",
      },
    },
    {
      $addFields: {
        author: { $arrayElemAt: ["$author_info", 0] },
      },
    },
    { $project: { author_info: 0 } }
  ];

  const feed = await experience.aggregate(pipeline).toArray();
  console.log("Feed returned", feed.length, "items.");
  
  for (const item of feed) {
    console.log(item.date, "- UID:", item.uid);
  }

  await client.close();
}
main().catch(console.error);
