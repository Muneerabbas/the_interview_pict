export const FEED_SORT_LATEST = "latest";
export const FEED_SORT_TRENDING = "trending";

export function normalizeFeedSort(sortParam) {
  return sortParam === FEED_SORT_TRENDING ? FEED_SORT_TRENDING : FEED_SORT_LATEST;
}

export const FEED_CACHE_VERSION_KEY = "feed_global_version_v1";

/**
 * Get current global feed version from Redis
 */
export async function getFeedVersion(redis) {
  if (!redis) return "1";
  try {
    const version = await redis.get(FEED_CACHE_VERSION_KEY);
    return version || "1";
  } catch (err) {
    console.warn("[cache] getFeedVersion failed:", err.message);
    return "1";
  }
}

/**
 * Increment global feed version to invalidate ALL feed caches instantly
 */
export async function incrementFeedVersion(redis) {
  if (!redis) return;
  try {
    await redis.incr(FEED_CACHE_VERSION_KEY);
    console.log("[cache] Global feed version incremented");
  } catch (err) {
    console.warn("[cache] incrementFeedVersion failed:", err.message);
  }
}

export function buildFeedCacheKey({
  page = 0,
  itemsPerPage = 10,
  sort = FEED_SORT_LATEST,
  company,
  college,
  branch,
  batch,
  version = "1",
}) {
  const normalizedSort = normalizeFeedSort(sort);
  const baseKey = `feed_v${version}_p${page}_l${itemsPerPage}_s${normalizedSort}`;
  const segments = [baseKey];

  if (company) segments.push(`cp_${encodeURIComponent(company)}`);
  if (college) segments.push(`cl_${encodeURIComponent(college)}`);
  if (branch) segments.push(`br_${encodeURIComponent(branch)}`);
  if (batch) segments.push(`bt_${encodeURIComponent(batch)}`);

  return segments.join("_");
}

export function getDefaultFeedInvalidationKeys() {
  // Note: With Global Versioning, we don't strictly need to delete keys one by one,
  // but we keep this for backwards compatibility or specific overrides.
  return [
    "top_stories_page_0",
  ];
}
