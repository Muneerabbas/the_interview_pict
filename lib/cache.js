import redis from "@/lib/redis";

export async function fetchWithCache(key, ttlSeconds, fetcherFunction) {
  try {
    if (redis) {
      if (redis.status === "wait") {
        await redis.connect();
      }

      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    }
  } catch (error) {
    console.warn(`[cache] GET fail-open for key=${key}:`, error?.message || error);
  }

  const freshData = await fetcherFunction();

  if (freshData !== undefined) {
    try {
      if (redis) {
        const payload = JSON.stringify(freshData);
        redis.set(key, payload, "EX", ttlSeconds).catch((err) => {
          console.warn(`[cache] async SET failed for key=${key}:`, err?.message || err);
        });
      }
    } catch (error) {
      console.warn(`[cache] SET fail-open for key=${key}:`, error?.message || error);
    }
  }

  return freshData;
}

export default fetchWithCache;
