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
      className={`${width} group relative mx-auto block cursor-pointer overflow-hidden rounded-2xl border border-slate-200/85 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-[2px] hover:border-blue-200 hover:shadow-[0_18px_48px_rgba(37,99,235,0.18)] dark:border-slate-700/90 dark:bg-slate-900/90 dark:shadow-[0_16px_40px_rgba(2,6,23,0.65)] dark:hover:border-cyan-500/45 dark:hover:shadow-[0_20px_52px_rgba(8,145,178,0.24)]`}
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-500 via-blue-600 to-indigo-500 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative p-4 sm:p-5">
        {/* Header Row: Avatar + Info (Left) | Stats (Right) */}
        <div className="flex items-start justify-between gap-4">
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
              <h2 className="line-clamp-1 text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-[17px]">
                {profileName || "Anonymous Candidate"}
              </h2>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
                <Clock size={11} className="text-slate-400 dark:text-slate-500" />
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
                <div className="ui-tag ui-tag-company inline-flex max-w-full items-center gap-1 py-0.5 pl-2 pr-1 text-[10.5px]">
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
                <div className="ui-tag ui-tag-role inline-flex items-center gap-1 py-0.5 px-2 text-[10.5px]">
                  <Briefcase size={11} strokeWidth={2.5} className="shrink-0" />
                  <span className="truncate">{roleName}</span>
                </div>
                <div className="ui-tag ui-tag-batch inline-flex items-center gap-1 py-0.5 px-2 text-[10.5px]">
                  <GraduationCap size={11} strokeWidth={2.5} className="shrink-0" />
                  <span className="truncate">{branchAndBatch}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200/60 bg-slate-50/50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-400">
              <Eye size={12} />
              {totalViews}
            </div>

            <button
              onClick={handleLike}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold transition-all duration-200 ${isLiked
                ? "border-pink-200 bg-pink-50 text-pink-600 shadow-sm dark:border-pink-500/35 dark:bg-pink-950/25 dark:text-pink-300"
                : "border-slate-200/60 bg-white text-slate-400 hover:border-pink-200 hover:bg-pink-50/50 hover:text-pink-500 dark:border-slate-700/50 dark:bg-slate-900/40 dark:text-slate-500 dark:hover:border-pink-500/35 dark:hover:text-pink-300"
                }`}
            >
              <Heart
                size={12}
                className={`transition-transform duration-200 ${isLiked ? "scale-110 fill-pink-500" : "group-hover/heart:scale-110"}`}
              />
              {likes.length}
            </button>
          </div>
        </div>

        {/* Content Zone: Experience Snapshot */}
        <div className="mt-4">
          <div className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500 opacity-60">
            Experience Snapshot
          </div>
          <div className="border-l-3 border-blue-600 pl-4 transition-colors group-hover:border-blue-500 dark:border-blue-500/60 dark:group-hover:border-blue-400">
            <p className="line-clamp-3 text-[14px] leading-[1.65] text-slate-600 dark:text-slate-300">
              {previewText}
            </p>
          </div>
        </div>

        {/* Footer Row: Read Time | Action Link */}
        <div className="mt-4 flex items-center justify-between gap-3 sm:mt-4.5">
          <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-400/80 dark:text-slate-500/80">
            ✦ {readTime} MIN READ
          </div>
          <div className="inline-flex items-center text-[12.5px] font-extrabold text-blue-700 transition-colors group-hover:text-blue-800 dark:text-cyan-300 dark:group-hover:text-cyan-200">
            <span>Read full experience</span>
            <ChevronRight size={15} className="ml-0.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
