export const FEED_SORT_LATEST = "latest";
export const FEED_SORT_TRENDING = "trending";

export function normalizeFeedSort(sortParam) {
  return sortParam === FEED_SORT_TRENDING ? FEED_SORT_TRENDING : FEED_SORT_LATEST;
}

export function buildFeedCacheKey({
  page = 0,
  itemsPerPage = 10,
  sort = FEED_SORT_LATEST,
  company,
}) {
  const normalizedSort = normalizeFeedSort(sort);
  const baseKey = `feed_page_${page}_limit_${itemsPerPage}_sort_${normalizedSort}`;

  return company ? `${baseKey}_company_${encodeURIComponent(company)}` : baseKey;
}

export function getDefaultFeedInvalidationKeys() {
  return [
    buildFeedCacheKey({ page: 0, itemsPerPage: 10, sort: FEED_SORT_LATEST }),
    buildFeedCacheKey({ page: 0, itemsPerPage: 10, sort: FEED_SORT_TRENDING }),
    buildFeedCacheKey({ page: 0, itemsPerPage: 6, sort: FEED_SORT_TRENDING }),
    "top_stories_page_0",
  ];
}
