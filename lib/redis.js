import Redis from "ioredis";

const globalForRedis = globalThis;

function createRedisClient() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("[redis] REDIS_URL is not set. Cache layer will fail-open.");
    return null;
  }

  const client = new Redis(redisUrl, {
    lazyConnect: true,
    enableReadyCheck: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 1500,
    commandTimeout: 1500,
    retryStrategy(times) {
      const base = 100;
      const max = 2000;
      return Math.min(base * 2 ** Math.min(times, 6), max);
    },
  });

  client.on("error", (err) => {
    console.warn("[redis] client error:", err?.message || err);
  });

  client.on("reconnecting", () => {
    console.warn("[redis] reconnecting...");
  });

  return client;
}

const redis = globalForRedis.__redisSingleton ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.__redisSingleton = redis;
}

export { redis };
export default redis;
