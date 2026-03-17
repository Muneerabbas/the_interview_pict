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
    <article className="group rounded-[2rem] border border-slate-200 bg-white p-8 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 dark:border-slate-800/80 dark:bg-slate-card">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner dark:border-slate-700 dark:bg-slate-800">
            <AdaptiveAvatar
              src={optionalCardImage}
              alt={`${company} avatar`}
              fallbackText={badgeText}
              className="size-14 object-cover text-2xl"
              textClassName="text-primary"
              fallbackClassName="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800"
            />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{company}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{role}</p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${difficulty.className}`}>
          {difficulty.text}
        </span>
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
          <span className="size-1 rounded-full bg-primary" /> Insider Take
        </div>
        <blockquote className="text-lg font-bold italic leading-relaxed text-slate-700 dark:text-slate-300">
          "{summarizeExperience(story?.exp_text, 170)}"
        </blockquote>
      </div>

      <div className="flex items-center gap-5 border-t border-slate-100 pt-6 text-slate-500 dark:border-slate-800/50">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Eye size={16} /> {formatCount(story?.views)}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Heart size={16} /> {formatCount((Number(story?.views) || 0) / 14)}
        </div>
        <div className="ml-auto text-xs font-bold text-slate-400">{author}</div>
      </div>

      <Link
        href={uid ? `/single/${uid}` : "/feed"}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-4 text-sm font-black text-slate-900 transition-all duration-300 group-hover:bg-primary group-hover:text-white dark:bg-slate-800 dark:text-white"
      >
        Read Full Story <ArrowRight size={16} />
      </Link>
    </article>
  );
}

export default function FeaturedSection({ stories = [] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-16 flex items-end justify-between">
        <div>
          <h2 className="mb-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">Top Interview Stories 🔥</h2>
          <p className="text-lg font-medium text-slate-500">Top-rated insider stories curated for your career growth.</p>
        </div>
        <Link href="/feed" className="group flex items-center gap-2 font-black text-primary transition-all hover:gap-3">
          Browse all <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <FeaturedCard key={story.uid} story={story} />
        ))}
      </div>
    </section>
  );
}
