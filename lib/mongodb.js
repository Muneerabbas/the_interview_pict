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
      // Feed and other read-heavy routes should remain available when an
      // Atlas replica-set member is temporarily unhealthy. The driver still
      // prefers the primary whenever it is available, then falls back to a
      // healthy secondary without disabling TLS verification.
      const client = new MongoClient(MONGODB_URI, {
        readPreference: "secondaryPreferred",
      });
      cached.promise = client.connect();
    }

    cached.client = await cached.promise;
  }

  return cached.client.db();
}
