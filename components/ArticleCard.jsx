import React from "react";
import Link from "next/link";
import { Building2, Briefcase, GraduationCap, CalendarDays, Eye, ArrowUpRight } from "lucide-react";

const ArticleCard = ({ article }) => {
  const { profile_pic, name, company, role, batch, date, views, uid, branch } = article || {};
  const displayName = name || "Anonymous Candidate";
  const formattedDate = date ? new Date(date).toLocaleDateString() : "Date unavailable";

  return (
    <Link
      href={`/single/${uid}`}
      prefetch={true}
      className="group relative block overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(37,99,235,0.16)] dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-[0_12px_34px_rgba(2,6,23,0.65)] dark:hover:border-cyan-500/40 dark:hover:shadow-[0_16px_38px_rgba(8,145,178,0.2)]"
      aria-label={`Read the experience of ${displayName}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-100/70 blur-2xl dark:bg-cyan-500/20" />

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 dark:border-slate-900 dark:ring-slate-700">
            <img
              src={profile_pic || "/api/placeholder/48/48"}
              alt={`${displayName}'s profile`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
              {displayName}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-medium text-slate-500 dark:text-slate-400">
              <span className="truncate">{company}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="truncate">{role}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="truncate">{branch} {batch}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="truncate">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/80">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition-colors group-hover:text-blue-800 dark:text-cyan-300 dark:group-hover:text-cyan-200">
          Read Experience
          <ArrowUpRight size={14} />
        </span>
        <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Eye size={13} />
          <span>{views || 0}</span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
