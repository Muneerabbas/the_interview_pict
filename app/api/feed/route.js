import { getCollection } from "@/lib/server/mongodb";
import { ok, serverError } from "@/lib/server/http";
import { parsePositiveInt } from "@/lib/server/validation";
import {
  DEFAULT_FEED_ITEMS_PER_PAGE,
  DEFAULT_FEED_PAGE,
} from "@/lib/server/config";

const REMOTE_BASE_URL = "https://the-interview-pict.vercel.app";

async function fetchRemoteFeed(page, itemsPerPage) {
  const remoteUrl = `${REMOTE_BASE_URL}/api/feed?page=${page}&itemsPerPage=${itemsPerPage}`;
  const response = await fetch(remoteUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Remote feed failed with ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function GET(req) {
  const page = parsePositiveInt(
    req.nextUrl.searchParams.get("page"),
    DEFAULT_FEED_PAGE,
    0
  );
  const itemsPerPage = parsePositiveInt(
    req.nextUrl.searchParams.get("itemsPerPage"),
    DEFAULT_FEED_ITEMS_PER_PAGE,
    1
  );

  try {
    const experience = await getCollection("experience");
    const feed = await experience
      .find({})
      .sort({ date: -1 })
      .skip(page * itemsPerPage)
      .limit(itemsPerPage)
      .toArray();

    if (feed.length > 0) {
      return ok(feed);
    }

    const remoteFeed = await fetchRemoteFeed(page, itemsPerPage);
    return ok(remoteFeed);
  } catch (error) {
    console.warn("Local feed unavailable, trying remote feed fallback.", error);
    try {
      const remoteFeed = await fetchRemoteFeed(page, itemsPerPage);
      return ok(remoteFeed);
    } catch (remoteError) {
      return serverError(remoteError, "Failed to fetch feed");
    }
  }
}
