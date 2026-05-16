import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { jsonError } from "@/lib/api-response";
import { toPublicPost } from "@/lib/post-shape";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";

/** Clamp a query param to a sane range: `?page=abc` produced $skip: NaN -> a 500. */
function clampInt(raw, fallback, min, max) {
  const value = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const page = clampInt(req.nextUrl.searchParams.get("page"), 0, 0, 1000);
    const itemsPerPage = clampInt(req.nextUrl.searchParams.get("itemsPerPage"), 30, 1, 50);

    const type = req.nextUrl.searchParams.get("type") || "interview";
    const db = await getMongoDb();
    const collectionName = type === "tale" ? "tales" : "experience";
    const collection = db.collection(collectionName);

    const pipeline = [
      {
        $match: { content_type: type }
      },
      {
        $addFields: {
          viewsInt: {
            $convert: {
              input: { $ifNull: ["$views", 0] },
              to: "int",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      { $sort: { viewsInt: -1, date: -1, _id: -1 } },
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
      // author_info is the raw joined user doc; strip it here, and toPublicPost
      // drops the `author` copy of it.
      { $project: { viewsInt: 0, author_info: 0 } },
    ];

    const raw = await collection.aggregate(pipeline).toArray();

    // Resolve the author's live Google photo/name from the joined user doc FIRST,
    // then shape: toPublicPost drops that joined doc along with the author email
    // and the array of liker emails, which this route used to return whole.
    const data = raw.map((item) =>
      toPublicPost(
        {
          ...item,
          profile_pic: resolveProfileImage(item),
          name: resolveProfileName(item),
        },
        { previewChars: 400 }
      )
    );

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error fetching top stories:", error);
    return jsonError(error, "Unable to load top stories");
  }
}
