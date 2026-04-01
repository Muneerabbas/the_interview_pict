import connectToDatabase from "@/lib/mongoose";
import { getMongoDb } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import User from "@/models/User";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const AUTH_TOKEN_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
const MAX_NOTIFICATIONS = 20;

export const dynamic = "force-dynamic";

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function truncate(value, maxLength = 110) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

function getTimeAgo(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "just now";

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
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

async function getAuthToken(req) {
  if (!AUTH_TOKEN_SECRET) return null;

  try {
    return await getToken({ req, secret: AUTH_TOKEN_SECRET });
  } catch {
    return null;
  }
}

async function resolveCurrentUser(token) {
  if (!token) return null;

  const tokenId = typeof token.id === "string" ? token.id : "";
  if (mongoose.Types.ObjectId.isValid(tokenId)) {
    const byId = await User.findById(tokenId)
      .select("_id gmail notificationState")
      .lean();
    if (byId?._id) return byId;
  }

  const email = normalizeEmail(token.email);
  if (!email) return null;

  return User.findOne({ gmail: email })
    .select("_id gmail notificationState")
    .lean();
}

function getPlainSeenMap(value) {
  if (!value) return {};
  if (value instanceof Map) return Object.fromEntries(value.entries());
  if (typeof value === "object") return value;
  return {};
}

function getExternalLikeCount(likes, userEmail) {
  if (!Array.isArray(likes)) return 0;
  return likes.filter((email) => normalizeEmail(email) !== userEmail).length;
}

async function getOwnedPosts(db, userEmail) {
  if (!userEmail) return [];

  return db
    .collection("experience")
    .find({
      email: {
        $regex: `^${escapeRegex(userEmail)}$`,
        $options: "i",
      },
    })
    .project({
      _id: 1,
      uid: 1,
      company: 1,
      role: 1,
      likes: 1,
      likesUpdatedAt: 1,
      date: 1,
    })
    .toArray();
}

async function getExperienceMetaMap(db, experienceIds) {
  const ids = Array.from(
    new Set(
      experienceIds
        .map((id) => String(id))
        .filter(Boolean)
    )
  ).map((id) => new mongoose.Types.ObjectId(id));

  if (!ids.length) return new Map();

  const experiences = await db
    .collection("experience")
    .find({ _id: { $in: ids } })
    .project({ _id: 1, uid: 1, company: 1, role: 1 })
    .toArray();

  return new Map(experiences.map((item) => [String(item._id), item]));
}

export async function GET(req) {
  await connectToDatabase();

  try {
    const token = await getAuthToken(req);
    const currentUser = await resolveCurrentUser(token);

    if (!currentUser?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getMongoDb();
    const currentUserId = String(currentUser._id);
    const currentUserEmail = normalizeEmail(currentUser.gmail);
    const notificationState = currentUser.notificationState || {};
    const lastCheckedAt = notificationState.lastCheckedAt
      ? new Date(notificationState.lastCheckedAt)
      : new Date(0);
    const postLikesSeen = getPlainSeenMap(notificationState.postLikesSeen);
    const commentLikesSeen = getPlainSeenMap(notificationState.commentLikesSeen);

    const [ownedComments, ownedPosts] = await Promise.all([
      Comment.find({ author: currentUser._id })
        .select("_id experience text upvotes createdAt updatedAt")
        .lean(),
      getOwnedPosts(db, currentUserEmail),
    ]);

    const ownedCommentIds = ownedComments.map((comment) => comment._id);
    const ownedCommentMap = new Map(ownedComments.map((comment) => [String(comment._id), comment]));

    const replyDocs = ownedCommentIds.length
      ? await Comment.find({
          parentComment: { $in: ownedCommentIds },
          author: { $ne: currentUser._id },
          createdAt: { $gt: lastCheckedAt },
        })
          .select("_id experience parentComment text author createdAt")
          .populate("author", "name")
          .sort({ createdAt: -1 })
          .limit(MAX_NOTIFICATIONS)
          .lean()
      : [];

    const experienceMetaMap = await getExperienceMetaMap(db, [
      ...ownedComments.map((comment) => comment.experience),
      ...replyDocs.map((comment) => comment.experience),
    ]);

    const replyNotifications = replyDocs.map((reply) => {
      const experienceMeta = experienceMetaMap.get(String(reply.experience));
      const parentComment = ownedCommentMap.get(String(reply.parentComment));
      const companyLabel = experienceMeta?.company || "your post";
      const roleLabel = experienceMeta?.role ? ` · ${experienceMeta.role}` : "";

      return {
        id: `reply-${reply._id}`,
        type: "reply",
        href: experienceMeta?.uid
          ? `/single/${experienceMeta.uid}#comment-${reply._id}`
          : null,
        title: `${reply.author?.name || "Someone"} replied to your comment`,
        message: truncate(reply.text, 96) || truncate(parentComment?.text, 96) || "Open the post to read the reply.",
        meta: `${companyLabel}${roleLabel}`,
        count: 1,
        timestamp: reply.createdAt,
        timeAgo: getTimeAgo(reply.createdAt),
      };
    });

    const commentLikeNotifications = ownedComments
      .map((comment) => {
        const commentId = String(comment._id);
        const currentLikes = Array.isArray(comment.upvotes) ? comment.upvotes.length : 0;
        const seenLikes = Number(commentLikesSeen[commentId]) || 0;
        const unreadLikes = Math.max(0, currentLikes - seenLikes);

        if (!unreadLikes) return null;

        const experienceMeta = experienceMetaMap.get(String(comment.experience));
        const companyLabel = experienceMeta?.company || "your discussion";
        const roleLabel = experienceMeta?.role ? ` · ${experienceMeta.role}` : "";

        return {
          id: `comment-like-${commentId}`,
          type: "comment-like",
          href: experienceMeta?.uid
            ? `/single/${experienceMeta.uid}#comment-${commentId}`
            : null,
          title: `${pluralize(unreadLikes, "new like")} on your comment`,
          message: truncate(comment.text, 96) || "Open the comment thread to see the latest activity.",
          meta: `${companyLabel}${roleLabel}`,
          count: unreadLikes,
          timestamp: comment.updatedAt || comment.createdAt,
          timeAgo: getTimeAgo(comment.updatedAt || comment.createdAt),
        };
      })
      .filter(Boolean);

    const postLikeNotifications = ownedPosts
      .map((post) => {
        const postId = String(post.uid || post._id);
        const currentLikes = getExternalLikeCount(post.likes, currentUserEmail);
        const seenLikes = Number(postLikesSeen[postId]) || 0;
        const unreadLikes = Math.max(0, currentLikes - seenLikes);

        if (!unreadLikes) return null;

        return {
          id: `post-like-${postId}`,
          type: "post-like",
          href: post.uid ? `/single/${post.uid}` : null,
          title: `${pluralize(unreadLikes, "new like")} on your post`,
          message: `${post.company || "Interview experience"}${post.role ? ` · ${post.role}` : ""}`,
          meta: `${pluralize(currentLikes, "total like")}`,
          count: unreadLikes,
          timestamp: post.likesUpdatedAt || post.date || new Date(),
          timeAgo: getTimeAgo(post.likesUpdatedAt || post.date || new Date()),
        };
      })
      .filter(Boolean);

    const notifications = [...replyNotifications, ...commentLikeNotifications, ...postLikeNotifications]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, MAX_NOTIFICATIONS);

    const unreadCount =
      replyNotifications.length +
      commentLikeNotifications.reduce((sum, item) => sum + (item.count || 0), 0) +
      postLikeNotifications.reduce((sum, item) => sum + (item.count || 0), 0);

    return NextResponse.json(
      {
        unreadCount,
        notifications,
        lastCheckedAt: lastCheckedAt.toISOString(),
        viewer: {
          id: currentUserId,
          email: currentUserEmail,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req) {
  await connectToDatabase();

  try {
    const token = await getAuthToken(req);
    const currentUser = await resolveCurrentUser(token);

    if (!currentUser?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getMongoDb();
    const currentUserEmail = normalizeEmail(currentUser.gmail);

    const [ownedComments, ownedPosts] = await Promise.all([
      Comment.find({ author: currentUser._id })
        .select("_id upvotes")
        .lean(),
      getOwnedPosts(db, currentUserEmail),
    ]);

    const postLikesSeen = Object.fromEntries(
      ownedPosts.map((post) => [
        String(post.uid || post._id),
        getExternalLikeCount(post.likes, currentUserEmail),
      ])
    );

    const commentLikesSeen = Object.fromEntries(
      ownedComments.map((comment) => [
        String(comment._id),
        Array.isArray(comment.upvotes) ? comment.upvotes.length : 0,
      ])
    );

    const now = new Date();

    await db.collection("user").updateOne(
      { _id: currentUser._id },
      {
        $set: {
          "notificationState.lastCheckedAt": now,
          "notificationState.postLikesSeen": postLikesSeen,
          "notificationState.commentLikesSeen": commentLikesSeen,
        },
      }
    );

    return NextResponse.json({
      success: true,
      unreadCount: 0,
      lastCheckedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
