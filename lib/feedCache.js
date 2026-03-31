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
  college,
  branch,
  batch,
}) {
  const normalizedSort = normalizeFeedSort(sort);
  const baseKey = `feed_page_${page}_limit_${itemsPerPage}_sort_${normalizedSort}`;
  const segments = [baseKey];

  if (company) segments.push(`company_${encodeURIComponent(company)}`);
  if (college) segments.push(`college_${encodeURIComponent(college)}`);
  if (branch) segments.push(`branch_${encodeURIComponent(branch)}`);
  if (batch) segments.push(`batch_${encodeURIComponent(batch)}`);

  return segments.join("_");
}

export function getDefaultFeedInvalidationKeys() {
  return [
    buildFeedCacheKey({ page: 0, itemsPerPage: 10, sort: FEED_SORT_LATEST }),
    buildFeedCacheKey({ page: 0, itemsPerPage: 10, sort: FEED_SORT_TRENDING }),
    buildFeedCacheKey({ page: 0, itemsPerPage: 6, sort: FEED_SORT_TRENDING }),
    "top_stories_page_0",
  ];
}
