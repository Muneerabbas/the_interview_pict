// api/search/route.js
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

const client = new MongoClient(uri);

async function main(search_text, page = 1) {
  await client.connect();
  console.log("Connected to MongoDB");
  const db = client.db("int-exp");
  const experience = db.collection("experience");
  
  const skip = (page - 1) * 10;
  
  const isDefault = search_text === "Himanshu-Nilay-Neeraj";
  const queryText = isDefault ? "" : search_text;

  let query = {};
  if (!isDefault) {
    // For robust matching, split query by space and match ALL terms (AND logic across terms)
    const terms = queryText.trim().split(/\s+/).filter(Boolean);
    if (terms.length > 0) {
      const conditions = terms.map(term => {
        const regexStr = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return {
          $or: [
            { company: { $regex: regexStr, $options: 'i' } },
            { role: { $regex: regexStr, $options: 'i' } },
            { name: { $regex: regexStr, $options: 'i' } },
            { branch: { $regex: regexStr, $options: 'i' } },
            { batch: { $regex: regexStr, $options: 'i' } },
            { exp_text: { $regex: regexStr, $options: 'i' } }
          ]
        };
      });
      query = { $and: conditions };
    }
  }

  const result = await experience
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(10)
    .toArray();

  return result;
}

export async function GET(req) {
  try {
    const search = req.nextUrl.searchParams.get("search");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    
    if (!search) {
      return NextResponse.json({ message: "Search query is required" }, { status: 400 });
    }
    
    const result = await main(search, page);
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
