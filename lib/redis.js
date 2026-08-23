import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Every call site is written `if (redis)`, so hand them a real null instead of
// throwing at module load when the env vars are absent.
const redis =
  url && token
    ? new Redis({
        url,
        token,
        fetch: (u, options) => fetch(u, { ...options, cache: "no-store" }),
      })
    : null;

if (!redis) {
  console.warn("[redis] UPSTASH_REDIS_REST_URL/TOKEN not set - caching and rate limiting are disabled.");
}

export default redis;
