import connectToDatabase from "@/lib/mongoose";
import Comment, { MAX_COMMENT_DEPTH, MAX_COMMENT_NESTING_LEVEL } from "@/models/Comment";
import User from "@/models/User";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const MAX_TEXT_LENGTH = 1000;
const ALLOWED_COMMENT_TYPES = new Set(["doubt", "tip", "experience", "general"]);
const AUTH_TOKEN_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

export const dynamic = "force-dynamic";

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function noStoreJson(payload, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}

function getTimeAgo(dateValue) {
  const date = new Date(dateValue);
  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));
  if (diffSeconds < 60) return "just now";

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

async function parseJsonBody(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function getAuthToken(req) {
  if (!AUTH_TOKEN_SECRET) return null;
  try {
    return await getToken({ req, secret: AUTH_TOKEN_SECRET });
  } catch {
    return null;
  }
}

async function resolveAuthorId(token) {
  if (!token) return null;

  const tokenId = typeof token.id === "string" ? token.id : "";
  if (mongoose.Types.ObjectId.isValid(tokenId)) {
    const byId = await User.findById(tokenId).select("_id").lean();
    if (byId?._id) return String(byId._id);
  }

  const email = typeof token.email === "string" ? token.email.trim().toLowerCase() : "";
  if (email) {
    const byEmail = await User.findOne({ gmail: email }).select("_id").lean();
    if (byEmail?._id) return String(byEmail._id);
  }

  return null;
}

async function resolveOrCreateAuthorId(token) {
  const existingAuthorId = await resolveAuthorId(token);
  if (existingAuthorId) return existingAuthorId;

  const email = typeof token?.email === "string" ? token.email.trim().toLowerCase() : "";
  if (!email) return null;

  const name =
    typeof token?.name === "string" && token.name.trim().length > 0
      ? token.name.trim()
      : email.split("@")[0] || "User";
  const image = typeof token?.picture === "string" ? token.picture : null;

  const upserted = await User.findOneAndUpdate(
    { gmail: email },
    {
      $set: {
        name,
        ...(image ? { image, profile_pic: image, profilePic_Url: image } : {}),
      },
      $setOnInsert: {
        gmail: email,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  )
    .select("_id")
    .lean();

  return upserted?._id ? String(upserted._id) : null;
}

function serializeAuthor(author) {
  if (!author || typeof author !== "object") return null;

  const name = author.name || null;
  return {
    id: author._id ? String(author._id) : null,
    name,
    initials: getInitials(name),
    profilePic: author.profilePic_Url || author.profile_pic || author.image || null,
    branch: author.branch || null,
    batch: author.batch || null,
  };
}

function serializeCommentNode(comment, viewerId = null) {
  const upvotes = Array.isArray(comment.upvotes) ? comment.upvotes.map((id) => String(id)) : [];
  const authorId = comment.author?._id ? String(comment.author._id) : null;
  const hasUpvoted = viewerId ? upvotes.includes(String(viewerId)) : false;
  const isOwnComment = Boolean(viewerId && authorId && String(viewerId) === authorId);

  return {
    id: String(comment._id),
    experienceId: String(comment.experience),
    parentCommentId: comment.parentComment ? String(comment.parentComment) : null,
    rootCommentId: comment.rootComment ? String(comment.rootComment) : null,
    depth: comment.depth,
    level: comment.depth + 1,
    text: comment.text,
    type: comment.type,
    isResolved: Boolean(comment.isResolved),
    upvotesCount: upvotes.length,
    hasUpvoted,
    canReply: comment.depth < MAX_COMMENT_DEPTH,
    canResolve: comment.type === "doubt" && isOwnComment,
    isOwnComment,
    author: serializeAuthor(comment.author),
    companyTag: null,
    timeAgo: getTimeAgo(comment.createdAt),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

function buildTreeWithCounts(comments, childrenByParent, depthLimit, viewerId = null) {
  const buildNode = (comment) => {
    const commentId = String(comment._id);
    const children = (childrenByParent.get(commentId) || [])
      .filter((child) => child.depth <= depthLimit)
      .map(buildNode);

    const nestedCount = children.reduce((sum, child) => sum + 1 + child.nestedCount, 0);

    return {
      ...serializeCommentNode(comment, viewerId),
      replyCount: children.length,
      nestedCount,
      replies: children,
    };
  };

  return comments.map(buildNode);
}

export async function GET(req) {
  await connectToDatabase();

  try {
    const token = await getAuthToken(req);
    const viewerId = await resolveAuthorId(token);

    const { searchParams } = new URL(req.url);
    const experienceId = searchParams.get("experienceId");

    if (!experienceId) {
      return noStoreJson({ error: "experienceId is required" }, 400);
    }

    if (!mongoose.Types.ObjectId.isValid(experienceId)) {
      return noStoreJson({ error: "Invalid experienceId" }, 400);
    }

    const page = Math.max(DEFAULT_PAGE, toInt(searchParams.get("page"), DEFAULT_PAGE));
    const limit = clamp(toInt(searchParams.get("limit"), DEFAULT_LIMIT), 1, MAX_LIMIT);
    const sort = (searchParams.get("sort") || "recent").toLowerCase();
    const depthLimitLevel = clamp(
      toInt(searchParams.get("depth"), MAX_COMMENT_NESTING_LEVEL),
      1,
      MAX_COMMENT_NESTING_LEVEL
    );
    const depthLimit = depthLimitLevel - 1;

    const skip = (page - 1) * limit;

    const topLevelFilter = {
      experience: experienceId,
      parentComment: null,
    };

    let topLevelComments = [];
    const [totalTopLevel] = await Promise.all([Comment.countDocuments(topLevelFilter)]);

    if (sort === "top") {
      const sortedTopIds = await Comment.aggregate([
        { $match: { experience: new mongoose.Types.ObjectId(experienceId), parentComment: null } },
        {
          $addFields: {
            upvotesCount: { $size: { $ifNull: ["$upvotes", []] } },
          },
        },
        { $sort: { upvotesCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { _id: 1 } },
      ]);

      const orderedIds = sortedTopIds.map((item) => item._id);
      const commentsById = new Map(
        (
          await Comment.find({ _id: { $in: orderedIds } })
            .select(
              "_id experience author parentComment rootComment depth text type isResolved upvotes createdAt updatedAt"
            )
            .populate("author", "name profilePic_Url profile_pic image branch batch")
            .lean()
        ).map((comment) => [String(comment._id), comment])
      );

      topLevelComments = orderedIds.map((id) => commentsById.get(String(id))).filter(Boolean);
    } else {
      const sortQuery = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
      topLevelComments = await Comment.find(topLevelFilter)
        .select(
          "_id experience author parentComment rootComment depth text type isResolved upvotes createdAt updatedAt"
        )
        .populate("author", "name profilePic_Url profile_pic image branch batch")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean();
    }

    const [totalComments, groupedCounts] = await Promise.all([
      Comment.countDocuments({ experience: experienceId }),
      Comment.aggregate([
        { $match: { experience: new mongoose.Types.ObjectId(experienceId) } },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            resolvedCount: {
              $sum: {
                $cond: [{ $eq: ["$isResolved", true] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const countsByType = {
      doubt: 0,
      tip: 0,
      experience: 0,
      general: 0,
    };
    let resolvedCount = 0;
    for (const item of groupedCounts) {
      if (item?._id && Object.prototype.hasOwnProperty.call(countsByType, item._id)) {
        countsByType[item._id] = item.count || 0;
      }
      resolvedCount += item.resolvedCount || 0;
    }

    if (topLevelComments.length === 0) {
      return NextResponse.json(
        {
          comments: [],
          hasMore: false,
          total: totalTopLevel,
          totalComments,
          countsByType,
          resolvedCount,
          unresolvedCount: Math.max(0, totalComments - resolvedCount),
          viewer: {
            id: viewerId || null,
            isAuthenticated: Boolean(viewerId),
          },
          uiConfig: {
            maxCommentLength: MAX_TEXT_LENGTH,
            maxNestingLevel: MAX_COMMENT_NESTING_LEVEL,
            allowedTypes: Array.from(ALLOWED_COMMENT_TYPES),
            defaultSort: "recent",
            supportedSorts: ["recent", "top", "oldest"],
          },
          sort,
          page,
          limit,
          maxNestingLevel: MAX_COMMENT_NESTING_LEVEL,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );
    }

    const rootIds = topLevelComments.map((comment) => comment._id);

    const descendants = await Comment.find({
      experience: experienceId,
      rootComment: { $in: rootIds },
      depth: { $lte: depthLimit },
    })
      .select("_id experience author parentComment rootComment depth text type isResolved upvotes createdAt updatedAt")
      .populate("author", "name profilePic_Url profile_pic image branch batch")
      .sort({ createdAt: 1 })
      .lean();

    const childrenByParent = new Map();

    for (const child of descendants) {
      const parentId = String(child.parentComment);
      const existing = childrenByParent.get(parentId);

      if (existing) {
        existing.push(child);
      } else {
        childrenByParent.set(parentId, [child]);
      }
    }

    const comments = buildTreeWithCounts(topLevelComments, childrenByParent, depthLimit, viewerId);
    const hasMore = totalTopLevel > skip + topLevelComments.length;

    return noStoreJson(
      {
        comments,
        hasMore,
        total: totalTopLevel,
        totalComments,
        countsByType,
        resolvedCount,
        unresolvedCount: Math.max(0, totalComments - resolvedCount),
        viewer: {
          id: viewerId || null,
          isAuthenticated: Boolean(viewerId),
        },
        uiConfig: {
          maxCommentLength: MAX_TEXT_LENGTH,
          maxNestingLevel: MAX_COMMENT_NESTING_LEVEL,
          allowedTypes: Array.from(ALLOWED_COMMENT_TYPES),
          defaultSort: "recent",
          supportedSorts: ["recent", "top", "oldest"],
        },
        sort,
        page,
        limit,
        maxNestingLevel: MAX_COMMENT_NESTING_LEVEL,
      }
    );
  } catch (error) {
    return noStoreJson({ error: "Failed to fetch comments" }, 500);
  }
}

export async function POST(req) {
  await connectToDatabase();

  try {
    const token = await getAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await parseJsonBody(req);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const experienceId = body?.experienceId;
    const parentCommentId = body?.parentCommentId || null;
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const type = typeof body?.type === "string" ? body.type.trim() : "general";
    const authorId = await resolveOrCreateAuthorId(token);

    if (!authorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!experienceId || !mongoose.Types.ObjectId.isValid(experienceId)) {
      return NextResponse.json({ error: "Valid experienceId is required" }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: `Text too long. Max ${MAX_TEXT_LENGTH} characters` }, { status: 400 });
    }
    if (!ALLOWED_COMMENT_TYPES.has(type)) {
      return NextResponse.json({ error: "Invalid comment type" }, { status: 400 });
    }

    let depth = 0;
    let rootComment = null;
    let parentComment = null;

    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        return NextResponse.json({ error: "Invalid parentCommentId" }, { status: 400 });
      }

      const parent = await Comment.findOne({
        _id: parentCommentId,
        experience: experienceId,
      })
        .select("_id depth rootComment")
        .lean();

      if (!parent) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }

      if (parent.depth >= MAX_COMMENT_DEPTH) {
        return NextResponse.json(
          {
            error: `Max nesting level reached (${MAX_COMMENT_NESTING_LEVEL})`,
            maxNestingLevel: MAX_COMMENT_NESTING_LEVEL,
          },
          { status: 400 }
        );
      }

      parentComment = parent._id;
      rootComment = parent.rootComment || parent._id;
      depth = parent.depth + 1;
    }

    const newComment = await Comment.create({
      experience: experienceId,
      author: authorId,
      parentComment,
      rootComment,
      depth,
      text,
      type,
    });

    const populated = await Comment.findById(newComment._id)
      .populate("author", "name profilePic_Url profile_pic image branch batch")
      .lean();

    return NextResponse.json(
      {
        comment: {
          ...serializeCommentNode(populated, authorId),
          replyCount: 0,
          nestedCount: 0,
          replies: [],
        },
        viewer: {
          id: authorId,
          isAuthenticated: true,
        },
        uiConfig: {
          maxCommentLength: MAX_TEXT_LENGTH,
          maxNestingLevel: MAX_COMMENT_NESTING_LEVEL,
          allowedTypes: Array.from(ALLOWED_COMMENT_TYPES),
        },
        maxNestingLevel: MAX_COMMENT_NESTING_LEVEL,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}

export async function PATCH(req) {
  await connectToDatabase();

  try {
    const token = await getAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const viewerId = await resolveOrCreateAuthorId(token);
    if (!viewerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJsonBody(req);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const commentId = body?.commentId;
    const action = body?.action;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: "Valid commentId is required" }, { status: 400 });
    }
    if (!["resolve", "unresolve"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const comment = await Comment.findById(commentId).select("_id author type isResolved").lean();
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (String(comment.author) !== String(viewerId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (comment.type !== "doubt") {
      return NextResponse.json({ error: "Only doubt comments can be resolved" }, { status: 400 });
    }

    const nextResolved = action === "resolve";
    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $set: { isResolved: nextResolved } },
      { new: true }
    )
      .select("_id isResolved")
      .lean();

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: String(updated._id),
          isResolved: Boolean(updated.isResolved),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}
