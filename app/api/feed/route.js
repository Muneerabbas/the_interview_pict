import { NextResponse } from "next/server";
import { resolveProfileName } from "@/lib/utils";
import { getMongoDb } from "@/lib/mongodb";
import mongoose from "mongoose";
import { jsonError } from "@/lib/api-response";
import { toPlainText } from "@/lib/text-preview";

export const dynamic = "force-dynamic";

const FEED_SORT_TRENDING = "trending";

function normalizeFeedSort(sort) {
  return sort === "trending" ? FEED_SORT_TRENDING : "latest";
}

function buildPipeline({
  sort,
  page,
  itemsPerPage,
  companyFilter,
  collegeFilter,
  branchFilter,
  batchFilter,
  authorFilter,
  categoryFilter,
  contentType,
  searchQuery,
  authorEmails,
}) {
  const pipeline = [];
  const match = { content_type: contentType || "interview" };
  if (companyFilter) match.company = companyFilter;
  if (collegeFilter) match.college = collegeFilter;
  if (branchFilter) match.branch = branchFilter;
  if (batchFilter) match.batch = batchFilter;
  if (authorFilter) match.email = authorFilter;
  if (contentType === "tale" && categoryFilter) match.category = categoryFilter;
  if (searchQuery) {
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const contains = { $regex: escaped, $options: "i" };
    match.$or = [
      { company: contains },
      { title: contains },
      { role: contains },
      { name: contains },
      { branch: contains },
      { college: contains },
      { exp_text: contains },
    ];
    if (authorEmails.length > 0) match.$or.push({ email: { $in: authorEmails } });
  }

  // Real "Trending this week" logic
  if (sort === FEED_SORT_TRENDING) {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 14); // Extended to 14 days just in case low volume
    match.date = { $gte: lastWeek.toISOString() };
  }

  pipeline.push({ $match: match });

  pipeline.push(
    {
      $sort:
        sort === FEED_SORT_TRENDING
          ? { views: -1, date: -1, _id: -1 }
          : { date: -1, _id: -1 },
    },
    { $skip: page * itemsPerPage },
    { $limit: itemsPerPage },
    {
      $lookup: {
        from: "user",
        localField: "email",
        foreignField: "gmail",
        as: "author_info",
      },
    },
    {
      $addFields: {
        author: { $arrayElemAt: ["$author_info", 0] },
      },
    },
    {
      $project: {
        author_info: 0,
      },
    }
  );
  return pipeline;
}

function processFeedResults(feed) {
  return feed.map((item) => {
    const authorImage = item.author?.image || item.author?.profile_pic || item.author?.profilePic;
    const preview = toPlainText(item.preview || item.exp_text || "");

    return {
      _id: item._id,
      uid: item.uid || null,
      company: item.company || "",
      role: item.role || "",
      college: item.college || "",
      branch: item.branch || "",
      batch: item.batch || "",
      email: item.email || "",
      profile_pic: authorImage || item.profile_pic || null,
      likes: item.likes || 0,
      views: item.views || 0,
      content_type: item.content_type || "interview",
      title: item.title || "",
      category: item.category || "",
      tags: Array.isArray(item.tags) ? item.tags.slice(0, 6) : [],
      preview,
      name: resolveProfileName({ ...item, ...item.author }),
      date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
    };
  });
}

export async function GET(req) {
  try {
    const rawPage = Number.parseInt(req.nextUrl.searchParams.get("page") || "0", 10);
    const rawItemsPerPage = Number.parseInt(req.nextUrl.searchParams.get("itemsPerPage") || "10", 10);
    const page = Number.isFinite(rawPage) && rawPage >= 0 ? Math.min(rawPage, 1000) : 0;
    const itemsPerPage = Number.isFinite(rawItemsPerPage) && rawItemsPerPage > 0
      ? Math.min(rawItemsPerPage, 20)
      : 10;
    const companyFilter = req.nextUrl.searchParams.get("company");
    const collegeFilter = req.nextUrl.searchParams.get("college");
    const branchFilter = req.nextUrl.searchParams.get("branch");
    const batchFilter = req.nextUrl.searchParams.get("batch");
    const authorFilter = req.nextUrl.searchParams.get("author");
    const contentType = req.nextUrl.searchParams.get("contentType") || "interview";
    const categoryFilter = contentType === "tale" ? req.nextUrl.searchParams.get("category") : "";
    const collectionName = contentType === "tale" ? "tales" : "experience";
    const searchQuery = req.nextUrl.searchParams.get("q")?.trim().slice(0, 80) || "";
    const sort = req.nextUrl.searchParams.get("sort") || "latest";
    const excludedIds = (req.nextUrl.searchParams.get("exclude") || "")
      .split(",")
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .slice(0, 200)
      .map((id) => new mongoose.Types.ObjectId(id));

    const db = await getMongoDb();
    if (req.nextUrl.searchParams.get("options") === "authors") {
      const authors = await db.collection(collectionName).aggregate([
        { $match: { content_type: contentType, email: { $type: "string", $ne: "" } } },
        { $group: { _id: "$email", postName: { $first: "$name" } } },
        { $lookup: { from: "user", localField: "_id", foreignField: "gmail", as: "profile" } },
        { $addFields: { profile: { $arrayElemAt: ["$profile", 0] } } },
        { $project: { _id: 0, value: "$_id", label: { $ifNull: ["$profile.name", "$postName"] } } },
        { $sort: { label: 1 } },
      ]).toArray();
      return NextResponse.json(authors.filter((author) => author.label));
    }
    let authorEmails = [];
    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const contains = { $regex: escaped, $options: "i" };
      const matchingUsers = await db.collection("user").find(
        {
          $or: [
            { name: contains },
            { headline: contains },
            { currentCompany: contains },
            { college: contains },
          ],
        },
        { projection: { gmail: 1 } }
      ).limit(100).toArray();
      authorEmails = matchingUsers.map((user) => user.gmail).filter(Boolean);
    }

    // Check which collection to hit: tales or experience
    const collection = db.collection(collectionName);

    let feed = [];

    if (sort === "random") {
      const randomMatch = { content_type: contentType };
      if (companyFilter) randomMatch.company = companyFilter;
      if (collegeFilter) randomMatch.college = collegeFilter;
      if (branchFilter) randomMatch.branch = branchFilter;
      if (batchFilter) randomMatch.batch = batchFilter;
      if (authorFilter) randomMatch.email = authorFilter;
      if (contentType === "tale" && categoryFilter) randomMatch.category = categoryFilter;
      if (searchQuery) {
        const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const contains = { $regex: escaped, $options: "i" };
        randomMatch.$or = [
          { company: contains },
          { title: contains },
          { role: contains },
          { name: contains },
          { branch: contains },
          { college: contains },
          { exp_text: contains },
        ];
        if (authorEmails.length > 0) randomMatch.$or.push({ email: { $in: authorEmails } });
      }
      if (excludedIds.length > 0) randomMatch._id = { $nin: excludedIds };

      feed = await collection.aggregate([
        { $match: randomMatch },
        { $sample: { size: itemsPerPage } },
        {
          $lookup: { from: "user", localField: "email", foreignField: "gmail", as: "author_info" },
        },
        { $addFields: { author: { $arrayElemAt: ["$author_info", 0] } } },
        { $project: { author_info: 0 } }
      ]).toArray();
    } else {
      const pipeline = buildPipeline({ sort, page, itemsPerPage, companyFilter, collegeFilter, branchFilter, batchFilter, authorFilter, categoryFilter, contentType, searchQuery, authorEmails });

      // If trending but no results, fallback to all-time views
      const matchStage = pipeline.find(s => s.$match);
      if (sort === "trending" && matchStage && matchStage.$match.date) {
        delete matchStage.$match.date;
      }

      feed = await collection.aggregate(pipeline).toArray();
    }

    const data = processFeedResults(feed);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error fetching feed:", error?.message || error);
    return jsonError(error, "Unable to load feed");
  }
}
