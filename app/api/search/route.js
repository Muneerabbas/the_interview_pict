import { getCollection } from "@/lib/server/mongodb";
import { badRequest, ok, serverError } from "@/lib/server/http";
import { parsePositiveInt, trimString } from "@/lib/server/validation";
import { SEARCH_PAGE_SIZE } from "@/lib/server/config";

async function searchExperiences(searchText, page = 1) {
  const skip = (page - 1) * SEARCH_PAGE_SIZE;
  const experience = await getCollection("experience");

  if (!searchText || searchText.toLowerCase() === "all") {
    return experience
      .find({})
      .sort({ date: -1 })
      .skip(skip)
      .limit(SEARCH_PAGE_SIZE)
      .toArray();
  }

  return experience
    .aggregate([
      {
        $search: {
          index: "main",
          compound: {
            should: [
              { text: { query: searchText, path: "company", score: { boost: { value: 8 } } } },
              { text: { query: searchText, path: "role", score: { boost: { value: 6 } }, fuzzy: {} } },
              { text: { query: searchText, path: "name", score: { boost: { value: 20 } }, fuzzy: {} } },
              { text: { query: searchText, path: "branch", score: { boost: { value: 10 } }, fuzzy: {} } },
              { text: { query: searchText, path: "batch", score: { boost: { value: 20 } } } },
              { text: { query: searchText, path: "exp_text", score: { boost: { value: 2 } }, fuzzy: {} } },
            ],
          },
        },
      },
      { $skip: skip },
      { $limit: SEARCH_PAGE_SIZE },
    ])
    .toArray();
}

export async function GET(req) {
  try {
    const search = trimString(req.nextUrl.searchParams.get("search"));
    const page = parsePositiveInt(req.nextUrl.searchParams.get("page"), 1, 1);

    if (!search) {
      return badRequest("Search query is required");
    }

    const result = await searchExperiences(search, page);
    return ok({ result });
  } catch (error) {
    return serverError(error, "Search failed");
  }
}
