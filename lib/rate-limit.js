import { NextResponse } from "next/server";
import redis from "@/lib/redis";

/**
 * Fixed-window rate limit backed by Upstash.
 *
 * ponytail: fixed window, not a sliding log -- a caller can burst 2x the limit
 * across a window boundary. Swap in a sliding window if that becomes a problem.
 */
export async function checkRateLimit(request, { key, limit, windowSeconds }) {
  if (!redis) return null; // no Redis configured: fail open rather than lock everyone out

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const bucket = `ratelimit:${key}:${ip}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;

  try {
    const count = await redis.incr(bucket);
    if (count === 1) await redis.expire(bucket, windowSeconds);

    if (count > limit) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down.", code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": String(windowSeconds) } }
      );
    }
  } catch (error) {
    // An Upstash outage must not take down writes.
    console.warn(`[ratelimit] fail-open for ${key}:`, error?.message || error);
  }

  return null;
}
