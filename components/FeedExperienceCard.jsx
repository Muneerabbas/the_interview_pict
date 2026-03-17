"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Eye, ThumbsUp } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";

function normalizeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function formatViews(value) {
  const views = Number(value) || 0;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return String(views);
}

function relativeDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const day = 24 * 60 * 60 * 1000;

  if (diffMs < day) return "Today";
  const days = Math.floor(diffMs / day);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function summarize(value, max = 190) {
  const text = normalizeText(value)
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return "Interview details are being updated. Open the full post to read this candidate's complete experience.";
  }

  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function buildTags(profile) {
  const tags = [
    normalizeText(profile?.company),
    normalizeText(profile?.role),
    normalizeText(profile?.branch),
  ]
    .filter(Boolean)
    .slice(0, 3)
    .map((item) => `#${item.replace(/\s+/g, "")}`);

  return tags.length ? tags : ["#InterviewExperience"];
}

function truncateHashtag(tag, max = 20) {
  const value = normalizeText(tag, "#InterviewExperience");
  const plain = value.replace(/^#+/, "");
  if (plain.length <= max) return plain;
  return `${plain.slice(0, Math.max(1, max - 3))}...`;
}

export default function FeedExperienceCard({ profile }) {
  const router = useRouter();
  const [coverBroken, setCoverBroken] = useState(false);
  const uid = normalizeText(profile?.uid);
  const company = normalizeText(profile?.company, "Unknown Company");
  const name = normalizeText(profile?.name, "Anonymous");
  const role = normalizeText(profile?.role, "Role not specified");
  const batch = normalizeText(profile?.batch, "Unknown Batch");
  const coverImage = normalizeText(profile?.cover_image || profile?.banner || profile?.thumbnail);
  const avatarImage = normalizeText(profile?.profile_pic);
  const tags = buildTags(profile);
  const coverBadge = normalizeText(tags[0], "#InterviewExperience");
  const coverBadgeDisplay = truncateHashtag(coverBadge, 20);

  const openArticle = () => {
    router.push(uid ? `/single/${uid}` : "/feed");
  };

  return (
    <article
      onClick={openArticle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openArticle();
        }
      }}
      tabIndex={0}
      role="link"
      className="group flex cursor-pointer flex-col items-stretch overflow-hidden rounded-2xl border border-border-dark/90 bg-surface-dark shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_28px_rgba(13,127,242,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 md:flex-row"
    >
      <div className="relative w-full shrink-0 overflow-hidden md:w-[320px]">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent" />
        {coverImage && !coverBroken ? (
          <img
            src={coverImage}
            alt={`${company} interview cover`}
            className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-full"
            loading="lazy"
            onError={() => setCoverBroken(true)}
          />
        ) : (
          <div className="flex h-52 w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-background-dark text-primary/80 md:h-full">
            <span className="max-w-[88%] break-all text-center text-2xl font-black tracking-wide text-primary">
              {coverBadgeDisplay}
            </span>
            <span className="mt-2 max-w-[90%] rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-primary break-all opacity-90">
              {coverBadgeDisplay}
            </span>
          </div>
        )}
        <div className="absolute bottom-4 left-4 z-20">
          <span className="rounded bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {company}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full border border-border-dark/80 p-0.5 shadow-[0_0_0_2px_rgba(13,127,242,0.08)] transition-all group-hover:border-primary/40">
              <ProfileAvatar
                src={avatarImage}
                alt={`${name} profile`}
                fallbackText={name}
                className="size-full rounded-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100 transition-colors group-hover:text-primary">{name}</p>
              <p className="text-xs text-slate-500">Batch of {batch} • {relativeDate(profile?.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border-dark/70 bg-background-dark/60 px-2.5 py-1 text-xs text-slate-500">
            <Eye size={14} className="text-primary/70" />
            <span>{formatViews(profile?.views)} views</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold leading-tight text-slate-100 transition-colors group-hover:text-primary">
            {role} Interview Experience at {company}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-400">{summarize(profile?.exp_text)}</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag) => (
            <span
              key={`${uid}-${tag}`}
              onClick={(event) => event.stopPropagation()}
              className="cursor-pointer rounded-full border border-border-dark/80 bg-background-dark/80 px-3 py-1 text-xs font-medium text-slate-400 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border-dark/60 pt-4">
          <Link
            href={uid ? `/single/${uid}` : "/feed"}
            onClick={(event) => event.stopPropagation()}
            className="flex items-center gap-1 text-sm font-bold text-primary transition-all hover:underline underline-offset-4"
          >
            Read More
          </Link>
          <div className="flex gap-4">
            <button
              onClick={(event) => event.stopPropagation()}
              className="group/btn flex items-center gap-1.5 text-slate-500 transition-all hover:text-primary"
              aria-label="Like post"
            >
              <ThumbsUp size={18} />
              <span className="text-xs font-semibold">{Math.max(1, Math.floor((Number(profile?.views) || 0) / 30))}</span>
            </button>
            <button
              onClick={(event) => event.stopPropagation()}
              className="text-slate-500 transition-all hover:text-primary"
              aria-label="Bookmark post"
            >
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
