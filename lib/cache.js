import redis from "@/lib/redis";

/**
 * Fetch data with Redis caching
 * @param {string} key - Cache key
 * @param {number} ttlSeconds - Time-to-live in seconds
 * @param {function} fetcherFunction - Function to fetch fresh data if cache miss
 * @returns {Promise<any>} - Cached or fresh data
 */
export async function fetchWithCache(key, ttlSeconds, fetcherFunction) {
  try {
    if (redis) {
      const cached = await redis.get(key);
      if (cached) {
        // Upstash redis.get() returns parsed JSON if the value was set as an object/array
        // But if it was stringified manually, we need to handle it.
        // Usually @upstash/redis handles JSON automatically.
        return typeof cached === "string" ? JSON.parse(cached) : cached;
      }
    }
  } catch (error) {
    console.warn(`[cache] GET fail-open for key=${key}:`, error?.message || error);
  }

  const freshData = await fetcherFunction();

  if (freshData !== undefined && freshData !== null) {
    try {
      if (redis) {
        // @upstash/redis set() signature: set(key, value, { ex: ttlSeconds })
        await redis.set(key, freshData, { ex: ttlSeconds });
      }
    } catch (error) {
      console.warn(`[cache] SET fail-open for key=${key}:`, error?.message || error);
    }
  }

  return freshData;
}

export default fetchWithCache;
