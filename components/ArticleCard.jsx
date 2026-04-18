import React from "react";
import Link from "next/link";
import { Building2, ArrowUpRight } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";

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

const ArticleCard = ({ article }) => {
  const { profile_pic, name, company, uid, exp_text } = article || {};
  const displayName = name || "Anonymous Candidate";

  const plainText = stripMarkdown(exp_text || "");
  const previewText =
    plainText.length > 200 ? `${plainText.slice(0, 200).trim()}...` : plainText || "No experience details shared yet.";

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
            </div>
          </div>
        </div>

        {/* Content Zone: Experience Snapshot */}
        <div className="mt-4 border-l-[3px] border-blue-600 pl-3.5 transition-colors group-hover:border-blue-500 dark:border-blue-500/60 dark:group-hover:border-blue-400">
          <p className="line-clamp-3 text-[13px] leading-[1.65] text-slate-600 dark:text-slate-300">
            {previewText}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100/80 bg-slate-50/50 px-5 py-3.5 dark:border-slate-800/50 dark:bg-slate-800/20">
        <span className="inline-flex items-center gap-1.5 text-sm font-black tracking-tight text-blue-700 transition-colors group-hover:text-blue-800 dark:text-cyan-300 dark:group-hover:text-cyan-200">
          Read Experience
          <ArrowUpRight size={16} strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
};

export default ArticleCard;
