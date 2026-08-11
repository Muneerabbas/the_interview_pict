import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const MONGOOSE_READ_PREFERENCE = {
  mode: "secondaryPreferred",
  maxStalenessSeconds: 90,
};

export function readQuery(query) {
  return query.read(MONGOOSE_READ_PREFERENCE.mode);
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        readPreference: "primary",
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        socketTimeoutMS: 15000,
      })
      .catch((error) => {
        cached.promise = null;
        cached.conn = null;
        throw error;
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
