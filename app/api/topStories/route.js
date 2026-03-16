import { getCollection } from "@/lib/server/mongodb";
import { ok, serverError } from "@/lib/server/http";
import { parsePositiveInt } from "@/lib/server/validation";
import { TOP_STORIES_PAGE_SIZE } from "@/lib/server/config";

const REMOTE_BASE_URL = "https://the-interview-pict.vercel.app";

async function fetchRemoteTopStories(page) {
  const remoteUrl = `${REMOTE_BASE_URL}/api/topStories?page=${page}`;
  const response = await fetch(remoteUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Remote top stories failed with ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function GET(req) {
  const page = parsePositiveInt(req.nextUrl.searchParams.get("page"), 0, 0);

  try {
    const experience = await getCollection("experience");
    const topStories = await experience
      .find({})
      .sort({ views: -1 })
      .skip(page * TOP_STORIES_PAGE_SIZE)
      .limit(TOP_STORIES_PAGE_SIZE)
      .toArray();

    if (topStories.length > 0) {
      return ok(topStories);
    }

    const remoteTopStories = await fetchRemoteTopStories(page);
    return ok(remoteTopStories);
  } catch (error) {
    console.warn("Local top stories unavailable, trying remote fallback.", error);
    try {
      const remoteTopStories = await fetchRemoteTopStories(page);
      return ok(remoteTopStories);
    } catch (remoteError) {
      return serverError(remoteError, "Failed to fetch top stories");
    }
  }
}
