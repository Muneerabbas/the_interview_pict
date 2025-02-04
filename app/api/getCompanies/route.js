import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Create a persistent MongoDB connection (outside the handler for performance)
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("int-exp");
const companyCollection = db.collection("dropdowns");

// Ensure the client is connected when the server starts
if (!client.isConnected()) {
  client.connect().then(() => {
    console.log("MongoDB connected successfully.");
  }).catch(error => {
    console.error("MongoDB connection failed", error);
  });
}

// API handler to fetch data
export async function GET(req) {
  try {
    // Query the collection to get the 'companies' array
    const result = await companyCollection.findOne({});

    // Check if data exists and return the companies array
    if (result && result.companies) {
      return NextResponse.json({
        success: true,
        data: result.companies,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No companies found in the database",
      });
    }
  } catch (error) {
    // Error handling
    console.error("Error fetching data from MongoDB:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred while fetching data",
    });
  }
}
