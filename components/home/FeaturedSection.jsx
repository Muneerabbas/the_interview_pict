import Link from "next/link";
import { ArrowRight, Eye, Heart } from "lucide-react";
import { difficultyLabel, formatCount, normalizeText, summarizeExperience } from "./homeUtils";
import AdaptiveAvatar from "./AdaptiveAvatar";

function buildBadgeText(story) {
  const first = normalizeText(story?.company);
  const second = normalizeText(story?.role);
  const third = normalizeText(story?.branch);
  const merged = [first, second, third].filter(Boolean).join(" ");
  if (!merged) return "Interview";
  return merged.length > 20 ? `${merged.slice(0, 17)}...` : merged;
}

function FeaturedCard({ story }) {
  const company = normalizeText(story?.company, "Unknown");
  const role = normalizeText(story?.role, "Role");
  const uid = normalizeText(story?.uid);
  const author = normalizeText(story?.name, "Anonymous");
  const difficulty = difficultyLabel(story);
  const optionalCardImage = normalizeText(story?.cover_image || story?.banner || story?.thumbnail);
  const badgeText = buildBadgeText(story);

  return (
    <article className="group h-full rounded-[1.5rem] border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-slate-900/75 p-6 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_6px_20px_rgba(13,127,242,0.1)]">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl border border-slate-700/70 bg-slate-800/80 shadow-inner">
            <AdaptiveAvatar
              src={optionalCardImage}
              alt={`${company} avatar`}
              fallbackText={badgeText}
              className="size-12 object-cover text-xl"
              textClassName="text-primary"
              fallbackClassName="bg-gradient-to-br from-slate-700 to-slate-800"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">{company}</h3>
            <p className="text-xs font-medium tracking-normal text-slate-400">{role}</p>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${difficulty.className}`}>
          {difficulty.text}
        </span>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.13em] text-primary/90">
          <span className="size-1 rounded-full bg-primary" /> Insider Take
        </div>
        <blockquote className="text-[15px] font-normal leading-7 text-slate-300">
          {summarizeExperience(story?.exp_text, 170)}
        </blockquote>
      </div>

      <div className="flex items-center gap-5 border-t border-slate-800/60 pt-4 text-slate-400">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Eye size={16} /> {formatCount(story?.views)}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Heart size={16} /> {formatCount((Number(story?.views) || 0) / 14)}
        </div>
        <div className="ml-auto text-xs font-medium text-slate-400">{author}</div>
      </div>

      <Link
        href={uid ? `/single/${uid}` : "/feed"}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 py-3 text-sm font-medium text-slate-100 transition-all duration-300 group-hover:border-primary/35 group-hover:bg-primary/85 group-hover:text-white"
      >
        Read Full Story <ArrowRight size={16} />
      </Link>
    </article>
  );
}

export default function FeaturedSection({ stories = [] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="mb-2 text-4xl font-extrabold tracking-tight text-slate-100">Top Interview Stories 🔥</h2>
          <p className="text-base font-normal text-slate-400">Top-rated insider stories curated for your career growth.</p>
        </div>
        <Link href="/feed" className="group flex items-center gap-2 font-semibold text-primary transition-all hover:gap-3">
          Browse all <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="relative overflow-visible">
        <div className="featured-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pl-5 pr-5 scroll-smooth">
          {stories.map((story, index) => (
            <div
              key={story.uid || `featured-${index}`}
              className="w-[82%] shrink-0 snap-center sm:w-[60%] lg:w-[40%] xl:w-[35%]"
            >
              <FeaturedCard story={story} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 -left-14 z-10 w-24 bg-gradient-to-r from-background-dark via-background-dark/70 to-transparent backdrop-blur-[1px]" />
        <div className="pointer-events-none absolute inset-y-0 -right-14 z-10 w-24 bg-gradient-to-l from-background-dark via-background-dark/70 to-transparent backdrop-blur-[1px]" />
      </div>
    </section>
  );
}
