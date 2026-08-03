"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowBigUp,
  BookOpen,
  Briefcase,
  Building2,
  Eye,
  GraduationCap,
  MessageSquare,
  Share2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDistanceToNowStrict } from "date-fns";
import ProfileAvatar from "./ProfileAvatar";
import { useAuthModal } from "@/components/AuthModalProvider";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";
import { companySlugFromName } from "@/lib/companySlug";

const stripMarkdown = (value = "") =>
  value
    .replace(/<[^>]*>?/g, " ")
    .replace(/https?:\/\/[^\s"'<>]+/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/[>#*_~|-]/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const PILL =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition";
const PILL_NEUTRAL =
  "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700";

export default function FeedPostCard({ profile }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const userEmail = session?.user?.email;

  const [likes, setLikes] = useState(profile?.likes || []);
  useEffect(() => setLikes(profile?.likes || []), [profile?.likes]);
  const isLiked = userEmail && likes.includes(userEmail);

  const isTale = profile?.content_type === "tale";
  const profilePic = resolveProfileImage(profile);
  const profileName = resolveProfileName(profile);
  const community = isTale ? "Tales" : profile?.company || "Interview";
  const companySlug = isTale ? "" : companySlugFromName(profile?.company);
  const role = isTale ? "" : profile?.role;
  const readPath = `/single/${profile?.uid || profile?._id}`;
  const openPost = () => router.push(readPath);

  const dateObj = profile?.date ? new Date(profile.date) : null;
  const timeAgo =
    dateObj && !Number.isNaN(dateObj.getTime())
      ? formatDistanceToNowStrict(dateObj, { addSuffix: true })
      : "";

  const plain = stripMarkdown(profile?.exp_text || "");
  const preview =
    plain.length > 280 ? `${plain.slice(0, 280).trim()}…` : plain || "No details shared yet.";
  const title = isTale
    ? profile?.title || "Untitled tale"
    : profile?.title || `${profile?.company || "Company"} Interview Experience`;
  const views = Number(profile?.views) || 0;
  const branchBatch = [profile?.branch, profile?.batch].filter(Boolean).join(" · ");

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      openAuthModal();
      return;
    }
    const previous = likes;
    const next = isLiked ? likes.filter((x) => x !== userEmail) : [...likes, userEmail];
    setLikes(next);
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profile.uid, email: userEmail }),
      });
      if (!res.ok) throw new Error("like failed");
    } catch {
      setLikes(previous);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${readPath}` : readPath;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
    } catch {
      /* user cancelled share — no-op */
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openPost}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPost();
        }
      }}
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition duration-150 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:px-5 sm:py-4"
    >
      {/* meta row — community · author · time */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <ProfileAvatar
          src={profilePic}
          name={profileName}
          alt={profileName}
          className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800"
        />
        {companySlug ? (
          <Link
            href={`/companies/${companySlug}`}
            prefetch
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:underline dark:text-slate-200"
          >
            <Building2 size={12} className="text-slate-400" />
            {community}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
            {isTale ? (
              <BookOpen size={12} className="text-blue-500" />
            ) : (
              <Building2 size={12} className="text-slate-400" />
            )}
            {community}
          </span>
        )}
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span className="truncate">{profileName}</span>
        {timeAgo ? (
          <>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="whitespace-nowrap">{timeAgo}</span>
          </>
        ) : null}
      </div>

      {/* title */}
      <h2 className="mt-2 text-[17px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
        {title}
      </h2>

      {/* preview */}
      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {preview}
      </p>

      {/* flair chips */}
      {role || branchBatch ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {role ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Briefcase size={11} />
              {role}
            </span>
          ) : null}
          {branchBatch ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <GraduationCap size={11} />
              {branchBatch}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* action bar */}
      <div className="mt-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleLike}
          aria-pressed={isLiked}
          className={`${PILL} ${
            isLiked
              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
              : PILL_NEUTRAL
          }`}
        >
          <ArrowBigUp
            size={16}
            className={isLiked ? "fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400" : ""}
          />
          {likes.length}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openPost();
          }}
          className={`${PILL} ${PILL_NEUTRAL}`}
        >
          <MessageSquare size={14} />
          <span className="hidden min-[400px]:inline">Comments</span>
        </button>

        <button type="button" onClick={handleShare} className={`${PILL} ${PILL_NEUTRAL}`}>
          <Share2 size={14} />
          <span className="hidden min-[400px]:inline">Share</span>
        </button>

        <span className="ml-auto inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <Eye size={13} />
          {views}
        </span>
      </div>
    </article>
  );
}
