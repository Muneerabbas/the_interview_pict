import React from "react";
import Link from "next/link";
import { Building2, Briefcase, GraduationCap, CalendarDays, Eye, ArrowUpRight } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";

const ArticleCard = ({ article }) => {
  const { profile_pic, name, company, role, batch, date, views, uid, branch } = article || {};
  const displayName = name || "Anonymous Candidate";
  const formattedDate = date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date unavailable";

  return (
    <Link
      href={`/single/${uid}`}
      prefetch={true}
      className="group relative block overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-400 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_20px_40px_rgba(37,99,235,0.12)] dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] dark:hover:border-cyan-500/30 dark:hover:shadow-[0_20px_44px_rgba(2,6,23,0.8)]"
      aria-label={`Read the experience of ${displayName}`}
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-80" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md ring-1 ring-slate-100 dark:border-slate-800 dark:ring-slate-800">
            <ProfileAvatar
              src={profile_pic}
              alt={displayName}
              name={displayName}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {displayName}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-cyan-400">{company}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{role}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              <span>{branch} {batch}</span>
              <span className="text-slate-300/60 dark:text-slate-600/60">•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100/80 bg-slate-50/50 px-5 py-3.5 dark:border-slate-800/50 dark:bg-slate-800/20">
        <span className="inline-flex items-center gap-1.5 text-sm font-black tracking-tight text-blue-700 transition-colors group-hover:text-blue-800 dark:text-cyan-300 dark:group-hover:text-cyan-200">
          Read Experience
          <ArrowUpRight size={16} strokeWidth={2.5} />
        </span>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Eye size={14} strokeWidth={2.2} />
          <span>{views || 0}</span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
