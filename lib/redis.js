import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
});

export default redis;
