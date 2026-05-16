import React from "react";
import Link from "next/link";
import { Building2, ArrowUpRight } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";

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
  const { company, uid, exp_text } = article || {};
  const profilePic = resolveProfileImage(article);
  const displayName = resolveProfileName(article);

  const plainText = stripMarkdown(exp_text || "");
  const previewText =
    plainText.length > 200 ? `${plainText.slice(0, 200).trim()}...` : plainText || "No experience details shared yet.";

  return (
    <Link
      href={`/single/${uid}`}
      prefetch={true}
      className="group relative block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
      aria-label={`Read the experience of ${displayName}`}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-slate-800">
            <ProfileAvatar
              src={profilePic}
              alt={displayName}
              name={displayName}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
              {displayName}
            </h3>
            <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Building2 size={12} className="text-slate-400" />
              <span className="truncate text-slate-600 dark:text-slate-300">{company}</span>
            </div>
          </div>
        </div>

        <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
          {previewText}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-800">
        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-blue-600 transition group-hover:gap-1.5 dark:text-blue-400">
          Read Experience
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
};

export default ArticleCard;
