import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

const READ_OPTIONS = {
  readPreference: "secondaryPreferred",
  maxStalenessSeconds: 90,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 15000,
};

const WRITE_OPTIONS = {
  readPreference: "primary",
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 15000,
};

const previousCache = global.mongodb;
const globalCache = previousCache?.read && previousCache?.write
  ? previousCache
  : {
      read: {
        client: previousCache?.client || null,
        promise: previousCache?.promise || null,
      },
      write: { client: null, promise: null },
    };

// Keep one pool per access mode. A read pool may use a healthy secondary, while
// the write pool is always primary-only.
global.mongodb = globalCache;

function getCache(mode) {
  return mode === "write" ? globalCache.write : globalCache.read;
}

export async function getMongoClient({ mode = "read" } = {}) {
  const cache = getCache(mode);
  if (cache.client) return cache.client;

  if (!cache.promise) {
    const client = new MongoClient(
      MONGODB_URI,
      mode === "write" ? WRITE_OPTIONS : READ_OPTIONS
    );
    cache.promise = client.connect().then(() => client).catch((error) => {
      cache.promise = null;
      cache.client = null;
      throw error;
    });
  }

  cache.client = await cache.promise;
  return cache.client;
}

export async function getMongoDb(options = {}) {
  const client = await getMongoClient(options);
  return client.db(process.env.MONGODB_DB_NAME);
}

export const mongoReadOptions = READ_OPTIONS;
export const mongoWriteOptions = WRITE_OPTIONS;
