import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
});

async function main() {
  const start = Date.now();
  await redis.set("test_key", "hello_faster_speeds", { ex: 60 });
  const val = await redis.get("test_key");
  const end = Date.now();
  console.log(`Redis working smoothly! Value: ${val}. Time taken: ${end - start}ms`);
}
main().catch(console.error);
