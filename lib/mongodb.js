import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

let cached = global.mongodb;

if (!cached) {
  cached = global.mongodb = {
    client: null,
    promise: null,
  };
}

export async function getMongoDb() {
  if (!cached.client) {
    if (!cached.promise) {
      const client = new MongoClient(MONGODB_URI);
      cached.promise = client.connect();
    }

    cached.client = await cached.promise;
  }

  return cached.client.db();
}
