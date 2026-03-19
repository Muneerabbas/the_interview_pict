"use client";

import Link from "next/link";
import { Building2, GraduationCap, Briefcase, ChevronRight, Clock, Sparkles } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";

const stripMarkdown = (value = "") => {
  return value
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/[>#*_~|-]/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const FeedCard = ({
  profile,
  width = "w-full",
}) => {
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
    ? (
      isToday
        ? `Today at ${dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
        : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    )
    : "Date unavailable";

  const plainText = stripMarkdown(profile?.exp_text || "");
  const previewText = plainText.length > 250 ? `${plainText.slice(0, 250).trim()}...` : plainText || "No experience details shared yet.";
  const totalViews = Number(profile?.views) || 0;

  return (
    <Link
      href={readPath}
      className={`${width} mx-auto block group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_34px_rgba(37,99,235,0.12)]`}
      prefetch={true}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500" />

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-20 blur-sm transition-opacity group-hover:opacity-30" />
              {profilePic && profilePic !== "" ? (
                <ProfileAvatar
                  src={profilePic}
                  alt="Profile"
                  className="relative z-10 h-14 w-14 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 text-xl font-bold text-white ring-2 ring-white">
                  {profileName.charAt(0).toUpperCase() || "S"}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[17px] font-extrabold uppercase tracking-tight text-slate-800">
                {profileName || "Anonymous Candidate"}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" />
                  {formattedDate}
                </span>
                {isToday && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <Sparkles size={10} />
                    Fresh
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {totalViews} views
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            <Building2 size={13} strokeWidth={2.5} />
            <span>{companyName}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
            <Briefcase size={13} strokeWidth={2.5} />
            <span>{roleName}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
            <GraduationCap size={13} strokeWidth={2.5} />
            <span>{branchAndBatch}</span>
          </div>
        </div>

        <p className="text-[15px] leading-7 text-slate-600">
          {previewText}
        </p>

        <div className="mt-5 inline-flex items-center text-sm font-bold text-blue-700 transition-colors group-hover:text-blue-800">
          <span>Read full experience</span>
          <ChevronRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default FeedCard;
