"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronRight,
  Clock,
  Eye,
  GraduationCap,
  Heart,
  Pencil,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ProfileAvatar from "./ProfileAvatar";
import { useAuthModal } from "@/components/AuthModalProvider";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";
import { companySlugFromName } from "@/lib/companySlug";

const stripMarkdown = (value = "") => {
  return value
    .replace(/<[^>]*>?/g, " ")
    .replace(/https?:\/\/[^\s"'<>]+/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/[>#*_~|-]/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const FeedCard = ({ profile, width = "w-full" }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const userEmail = session?.user?.email;

  const [likes, setLikes] = useState(profile?.likes || []);

  // Synchronize state with props when the feed data refreshes
  useEffect(() => {
    setLikes(profile?.likes || []);
  }, [profile?.likes]);

  const isLiked = userEmail && likes.includes(userEmail);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      openAuthModal();
      return;
    }

    const newLikes = isLiked
      ? likes.filter((email) => email !== userEmail)
      : [...likes, userEmail];

    setLikes(newLikes);

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profile.uid, email: userEmail }),
      });
      if (!res.ok) throw new Error("Failed to like");
    } catch (err) {
      console.error(err);
      // Revert on error
      setLikes(likes);
    }
  };

  const profilePic = resolveProfileImage(profile);
  const profileName = resolveProfileName(profile);
  const companyName = profile?.company || "Company not shared";
  const roleName = profile?.role || "Role not shared";
  const branchAndBatch = `${profile?.branch || "Branch"} ${profile?.batch || ""}`.trim();
  const readPath = `/single/${profile?.uid || profile?._id}`;
  const editPath = profile?.uid ? `/edit/${profile.uid}` : null;
  const companySlug = companySlugFromName(companyName);
  const authorEmail = profile?.email ? String(profile.email) : "";
  const isOwner =
    userEmail &&
    authorEmail &&
    userEmail.toLowerCase() === authorEmail.toLowerCase();

  const openPost = () => router.push(readPath);

  const dateObj = profile?.date ? new Date(profile.date) : null;
  const hasDate = dateObj && !Number.isNaN(dateObj.getTime());
  const isToday = hasDate && dateObj.toDateString() === new Date().toDateString();
  const formattedDate = hasDate
    ? isToday
      ? `Today at ${dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
      : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Date unavailable";

  const plainText = stripMarkdown(profile?.exp_text || "");
  const previewText =
    plainText.length > 300 ? `${plainText.slice(0, 300).trim()}...` : plainText || "No experience details shared yet.";
  const totalViews = Number(profile?.views) || 0;
  const readTime = Math.max(1, Math.round(previewText.split(/\s+/).filter(Boolean).length / 180));


  return (
    <div
      role="link"
      tabIndex={0}
      onClick={openPost}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPost();
        }
      }}
      className={`${width} group relative mx-auto block h-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 border-l-4 border-l-blue-600 bg-white/95 shadow-[0_10px_26px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)] dark:border-slate-700/90 dark:border-l-cyan-400 dark:bg-slate-900/95 dark:shadow-[0_12px_30px_rgba(2,6,23,0.6)] dark:hover:shadow-[0_18px_42px_rgba(2,6,23,0.7)]`}
    >
      <div className="relative flex h-full flex-col p-5 sm:p-6">
        {/* Header Row: Avatar + Info */}
        <div className="flex items-start gap-4">
          <div
            className="flex min-w-0 items-start gap-3"
            aria-label={`View experience by ${profileName || "user"}`}
          >
            <div className="relative shrink-0 mt-0.5">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-20 blur-sm transition-opacity group-hover:opacity-35" />
              <ProfileAvatar
                src={profilePic}
                name={profileName}
                alt={profileName}
                className="relative z-10 h-11 w-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 sm:h-12 sm:w-12"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-1 text-[17px] font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-[18px]">
                {profileName || "Anonymous Candidate"}
              </h2>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 sm:text-[11px]">
                <Clock size={10} className="text-slate-400/80 dark:text-slate-500" />
                {formattedDate}
                {isToday && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300">
                    <Sparkles size={9} />
                    Fresh
                  </span>
                )}
              </div>

              {/* Tags: Tucked directly beneath Info */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <div className="ui-tag ui-tag-company inline-flex max-w-full items-center gap-1 border-blue-300/70 bg-blue-50/90 py-0.5 pl-2 pr-1 text-[10.5px] font-semibold text-blue-700 dark:border-cyan-500/40 dark:bg-cyan-950/35 dark:text-cyan-200">
                  <Building2 size={11} strokeWidth={2.5} className="shrink-0" />
                  {companySlug ? (
                    <Link
                      href={`/companies/${companySlug}`}
                      prefetch={true}
                      onClick={(e) => e.stopPropagation()}
                      className="truncate font-semibold hover:underline"
                    >
                      {companyName}
                    </Link>
                  ) : (
                    <span className="truncate">{companyName}</span>
                  )}
                  {/* isOwner && editPath && (
                    <Link
                      href={editPath}
                      prefetch={true}
                      onClick={(e) => e.stopPropagation()}
                      title="Edit post details"
                      className="ml-0.5 inline-flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-bold text-blue-700 hover:bg-blue-50 dark:text-cyan-300 dark:hover:bg-slate-800"
                    >
                      <Pencil size={10} strokeWidth={2.5} />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                  ) */}
                </div>
                <div className="ui-tag ui-tag-role inline-flex items-center gap-1 border-slate-300/60 bg-slate-100/80 px-2 py-0.5 text-[10.5px] font-medium text-slate-600 dark:border-slate-600/60 dark:bg-slate-800/70 dark:text-slate-300">
                  <Briefcase size={11} strokeWidth={2.5} className="shrink-0" />
                  <span className="truncate">{roleName}</span>
                </div>
                <div className="ui-tag ui-tag-batch inline-flex items-center gap-1 border-slate-200/70 bg-slate-50/70 px-2 py-0.5 text-[10.5px] font-medium text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-400">
                  <GraduationCap size={11} strokeWidth={2.5} className="shrink-0" />
                  <span className="truncate">{branchAndBatch}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Zone: Experience Snapshot */}
        <div className="mt-5">
          <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-slate-400/80 dark:text-slate-500/80">
            Experience Snapshot
          </div>
          <div className="pl-1">
            <p className="line-clamp-3 text-[14px] leading-[1.82] text-slate-600 dark:text-slate-300">
              {previewText}
            </p>
          </div>
        </div>

        {/* Footer Row: Stats + Read Link */}
        <div className="mt-auto border-t border-slate-200/75 pt-3 dark:border-slate-700/75">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200/60 bg-slate-50/70 px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-500">
                <Eye size={11} />
                {totalViews}
              </div>

              <button
                onClick={handleLike}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all duration-200 ${isLiked
                  ? "border-pink-200 bg-pink-50 text-pink-600 shadow-sm dark:border-pink-500/35 dark:bg-pink-950/25 dark:text-pink-300"
                  : "border-slate-200/60 bg-white/90 text-slate-400 hover:border-pink-200 hover:bg-pink-50/50 hover:text-pink-500 dark:border-slate-700/60 dark:bg-slate-900/55 dark:text-slate-500 dark:hover:border-pink-500/35 dark:hover:text-pink-300"
                  }`}
              >
                <Heart
                  size={11}
                  className={`transition-transform duration-200 ${isLiked ? "scale-110 fill-pink-500" : "group-hover/heart:scale-110"}`}
                />
                {likes.length}
              </button>

              <div className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.05em] text-slate-400/90 dark:text-slate-500/85">
                ✦ {readTime} MIN
              </div>
            </div>

            <div className="inline-flex items-center text-[13px] font-extrabold text-blue-700 transition-colors group-hover:text-blue-800 dark:text-cyan-300 dark:group-hover:text-cyan-200">
              <span>Read full experience</span>
              <ChevronRight size={16} className="ml-0.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
