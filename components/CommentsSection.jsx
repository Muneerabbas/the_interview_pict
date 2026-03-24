"use client";

import { CheckCircle2, Heart, MessageSquare, Reply, Send, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/components/AuthModalProvider";

const TYPE_META = {
  doubt: { label: "Doubt", badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/35 dark:text-amber-300 dark:border-amber-500/35" },
  tip: { label: "Tip", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/35 dark:text-emerald-300 dark:border-emerald-500/35" },
  experience: { label: "My experience", badgeClass: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/35 dark:text-violet-300 dark:border-violet-500/35" },
  general: { label: "General", badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
};

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function initialsFromName(name) {
  if (!name) return "U";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function CommentsSection({ experienceId, companyName, articleAuthorName }) {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const { openAuthModal } = useAuthModal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [meta, setMeta] = useState({
    totalComments: 0,
    countsByType: { doubt: 0, tip: 0, experience: 0, general: 0 },
    resolvedCount: 0,
    uiConfig: { maxCommentLength: 1000, allowedTypes: ["doubt", "tip", "experience", "general"] },
  });

  const [sort, setSort] = useState("top");
  const [filter, setFilter] = useState("all");
  const [composeType, setComposeType] = useState("general");
  const [composeText, setComposeText] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [expanded, setExpanded] = useState({});
  const [postingReplyId, setPostingReplyId] = useState("");
  const [liked, setLiked] = useState({});

  const loadComments = useCallback(async () => {
    if (!experienceId) {
      setError("Comments unavailable: invalid experience id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/comments?experienceId=${encodeURIComponent(experienceId)}&page=1&limit=40&depth=5&sort=${encodeURIComponent(sort)}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to fetch comments");
      }
      setComments(Array.isArray(json.comments) ? json.comments : []);
      setMeta({
        totalComments: json.totalComments || 0,
        countsByType: json.countsByType || { doubt: 0, tip: 0, experience: 0, general: 0 },
        resolvedCount: json.resolvedCount || 0,
        uiConfig: json.uiConfig || { maxCommentLength: 1000, allowedTypes: ["doubt", "tip", "experience", "general"] },
      });
    } catch (err) {
      setError(err.message || "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  }, [experienceId, sort]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const filteredComments = useMemo(() => {
    if (filter === "all") return comments;
    if (filter === "resolved") return comments.filter((item) => item.isResolved);
    return comments.filter((item) => item.type === filter);
  }, [comments, filter]);

  const toggleLikeLocal = (commentId) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setLiked((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const upvoteCountDisplay = (item) => {
    const delta = liked[item.id] ? 1 : 0;
    return Math.max(0, (item.upvotesCount || 0) + delta);
  };

  const submitComment = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const trimmed = composeText.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId,
          text: trimmed,
          type: composeType,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to post comment");
      setComposeText("");
      await loadComments();
    } catch (err) {
      setError(err.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const submitReply = async (parent) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const value = (replyDrafts[parent.id] || "").trim();
    if (!value || postingReplyId) return;
    setPostingReplyId(parent.id);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId,
          parentCommentId: parent.id,
          text: value,
          type: parent.type || "general",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to post reply");
      setReplyDrafts((prev) => ({ ...prev, [parent.id]: "" }));
      setExpanded((prev) => ({ ...prev, [parent.id]: true }));
      await loadComments();
    } catch (err) {
      setError(err.message || "Failed to post reply");
    } finally {
      setPostingReplyId("");
    }
  };

  const renderComment = (item, level = 0) => {
    const typeMeta = TYPE_META[item.type] || TYPE_META.general;
    const repliesOpen = Boolean(expanded[item.id]);
    const hasReplies = (item.replyCount || 0) > 0;
    const authorInitials = item.author?.initials || initialsFromName(item.author?.name);
    const isArticleAuthor =
      articleAuthorName &&
      item.author?.name &&
      String(articleAuthorName).trim().toLowerCase() === String(item.author.name).trim().toLowerCase();

    return (
      <div key={item.id} className={cn("rounded-2xl border border-slate-200/80 bg-white/95 p-4 dark:border-slate-700/80 dark:bg-slate-900/90 sm:p-5", level > 0 && "mt-3")}>
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {authorInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.author?.name || "Anonymous"}</span>
              {isArticleAuthor ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300">Author</span>
              ) : null}
              {item.author?.batch ? (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-cyan-950/35 dark:text-cyan-300">{item.author.batch}</span>
              ) : null}
              <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", typeMeta.badgeClass)}>
                {typeMeta.label}
              </span>
              {item.isResolved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-emerald-950/35 dark:text-emerald-300">
                  <CheckCircle2 size={10} />
                  Resolved
                </span>
              ) : null}
              <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{item.timeAgo || ""}</span>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{item.text}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => toggleLikeLocal(item.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium transition",
                  liked[item.id]
                    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/35 dark:text-rose-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                )}
              >
                <Heart size={12} />
                {upvoteCountDisplay(item)} helpful
              </button>
              {item.canReply ? (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: true }))}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Reply size={12} />
                  Reply
                </button>
              ) : null}
              {hasReplies ? (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-medium text-blue-700 hover:bg-blue-100 dark:border-cyan-500/35 dark:bg-cyan-950/35 dark:text-cyan-300 dark:hover:bg-cyan-950/50"
                >
                  {repliesOpen ? "Hide replies" : `View ${item.replyCount} repl${item.replyCount === 1 ? "y" : "ies"}`}
                </button>
              ) : null}
            </div>

            {(repliesOpen || hasReplies) && item.canReply ? (
              <div className="mt-3 flex items-center gap-2">
                <input
                  value={replyDrafts[item.id] || ""}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  onFocus={() => {
                    if (!isAuthenticated) openAuthModal();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitReply(item);
                    }
                  }}
                  readOnly={!isAuthenticated}
                  placeholder="Add a reply..."
                  className="h-9 w-full rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-500 transition focus:border-blue-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/30"
                />
                <button
                  type="button"
                  onClick={() => submitReply(item)}
                  disabled={postingReplyId === item.id || !(replyDrafts[item.id] || "").trim()}
                  className="inline-flex h-9 items-center gap-1 rounded-full bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-cyan-600 dark:hover:bg-cyan-500 dark:disabled:bg-slate-700"
                >
                  <Send size={12} />
                  Send
                </button>
              </div>
            ) : null}

            {repliesOpen && Array.isArray(item.replies) && item.replies.length > 0 ? (
              <div className="mt-3 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
                {item.replies.map((child) => renderComment(child, level + 1))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-[0_18px_44px_rgba(2,6,23,0.65)] sm:p-7">
      <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-blue-200/25 blur-3xl dark:bg-cyan-500/15" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-52 w-52 rounded-full bg-cyan-200/25 blur-3xl dark:bg-blue-500/15" />

      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
        <h2 className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          <MessageSquare size={20} className="text-blue-600 dark:text-cyan-300" />
          Discussion
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-cyan-950/35 dark:text-cyan-300">
            {meta.totalComments} comments
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setSort((prev) => (prev === "top" ? "recent" : "top"))}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <SlidersHorizontal size={13} />
          {sort === "top" ? "Top" : "Recent"}
        </button>
      </div>

      <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70 sm:p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tag as:</span>
          {meta.uiConfig.allowedTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setComposeType(type)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                composeType === type
                  ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-cyan-500/35 dark:bg-cyan-950/35 dark:text-cyan-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {TYPE_META[type]?.label || type}
            </button>
          ))}
        </div>
        <textarea
          value={composeText}
          onChange={(e) => setComposeText(e.target.value.slice(0, meta.uiConfig.maxCommentLength || 1000))}
          onFocus={() => {
            if (!isAuthenticated) openAuthModal();
          }}
          readOnly={!isAuthenticated}
          placeholder={
            isAuthenticated
              ? `Ask a doubt, share a tip, or discuss your experience at ${companyName || "this company"}...`
              : "Sign in to add your comment"
          }
          className="min-h-[90px] w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none ring-blue-500 transition focus:border-blue-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/30"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {composeText.length}/{meta.uiConfig.maxCommentLength || 1000}
          </span>
          <button
            type="button"
            onClick={submitComment}
            disabled={posting || !composeText.trim()}
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-cyan-600 dark:hover:bg-cyan-500 dark:disabled:bg-slate-700"
          >
            Post
          </button>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-700">
        {[
          { key: "all", label: "All" },
          { key: "doubt", label: "Doubts" },
          { key: "tip", label: "Tips" },
          { key: "experience", label: "Experiences" },
          { key: "resolved", label: "Resolved" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              filter === item.key
                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-cyan-500/35 dark:bg-cyan-950/35 dark:text-cyan-300"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {loading ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((n) => (
            <div key={n} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
          ))}
        </div>
      ) : filteredComments.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          No comments yet. Start the discussion.
        </p>
      ) : (
        <div className="relative mt-4 space-y-3">{filteredComments.map((item) => renderComment(item))}</div>
      )}

    </section>
  );
}
