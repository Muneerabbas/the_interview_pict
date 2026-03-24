"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  ChevronRight,
  Clock,
  Eye,
  GraduationCap,
  Heart,
  Quote,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ProfileAvatar from "./ProfileAvatar";
import { useAuthModal } from "@/components/AuthModalProvider";

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

  const profilePic = profile?.profile_pic?.replace(/\"/g, "") || "";
  const profileName = profile?.name?.replace(/\"/g, "") || "";
  const companyName = profile?.company || "Company not shared";
  const roleName = profile?.role || "Role not shared";
  const branchAndBatch = `${profile?.branch || "Branch"} ${profile?.batch || ""}`.trim();
  const readPath = `/single/${profile?.uid || profile?._id}`;

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
    <Link
      href={readPath}
      className={`${width} group relative mx-auto block overflow-hidden rounded-3xl border border-slate-200/85 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_42px_rgba(37,99,235,0.16)]`}
      prefetch={true}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(59,130,246,0.12),transparent_42%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-500 via-blue-600 to-indigo-500" />

      <div className="relative p-4 sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-20 blur-sm transition-opacity group-hover:opacity-35" />
              {profilePic ? (
                <ProfileAvatar
                  src={profilePic}
                  alt="Profile"
                  className="relative z-10 h-12 w-12 rounded-full object-cover ring-2 ring-white sm:h-14 sm:w-14"
                />
              ) : (
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 text-lg font-bold text-white ring-2 ring-white sm:h-14 sm:w-14 sm:text-xl">
                  {profileName.charAt(0).toUpperCase() || "S"}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-1 text-base font-extrabold tracking-tight text-slate-900 sm:text-[17px]">
                {profileName || "Anonymous Candidate"}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500 sm:gap-2 sm:text-xs">
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" />
                  {formattedDate}
                </span>
                {isToday && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:text-[11px]">
                    <Sparkles size={10} />
                    Fresh
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              <Eye size={13} />
              {totalViews}
            </div>

            <button
              onClick={handleLike}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-200 ${isLiked
                ? "border-pink-200 bg-pink-50 text-pink-600 shadow-sm"
                : "border-slate-200 bg-white text-slate-500 hover:border-pink-200 hover:bg-pink-50/50 hover:text-pink-500"
                }`}
            >
              <Heart
                size={13}
                className={`transition-transform duration-200 ${isLiked ? "scale-110 fill-pink-500" : "group-hover/heart:scale-110"}`}
              />
              {likes.length}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            <Building2 size={13} strokeWidth={2.5} className="shrink-0" />
            <span className="truncate">{companyName}</span>
          </div>
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
            <Briefcase size={13} strokeWidth={2.5} className="shrink-0" />
            <span className="truncate">{roleName}</span>
          </div>
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
            <GraduationCap size={13} strokeWidth={2.5} className="shrink-0" />
            <span className="truncate">{branchAndBatch}</span>
          </div>
        </div>

        <div className="mt-4 rounded-[14px] sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 sm:p-4">
          <div className="mb-1.5 sm:mb-2 inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-xs">
            <Quote size={12} className="sm:w-[13px] sm:h-[13px]" />
            Experience Snapshot
          </div>
          <p className="line-clamp-2 sm:line-clamp-4 text-[13px] leading-[1.6] text-slate-600 sm:text-[15px] sm:leading-7 sm:text-slate-700">{previewText}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:mt-5">
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 sm:text-xs">
            <ArrowUpRight size={14} />
            {readTime} min read
          </div>
          <div className="inline-flex items-center text-[13px] font-bold text-blue-700 transition-colors group-hover:text-blue-800 sm:text-sm">
            <span>Read full experience</span>
            <ChevronRight size={16} className="ml-0.5 transition-transform duration-300 group-hover:translate-x-1 sm:ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeedCard;
