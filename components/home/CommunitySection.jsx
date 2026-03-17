import Link from "next/link";
import AdaptiveAvatar from "./AdaptiveAvatar";
import { formatCount } from "./homeUtils";

function CommunityCard({ item }) {
  const href = item?.uid ? `/single/${item.uid}` : "/feed";
  const company = item?.company || "Unknown Company";
  const role = item?.role || "Candidate";
  const author = item?.author || "Anonymous Candidate";
  const batch = item?.batch || "N/A";
  const reads = formatCount(item?.views);

  return (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-[2.5rem]">
      <article className="group relative rounded-[2.5rem] border border-slate-800 bg-slate-900 p-10 transition-transform duration-500 hover:-translate-y-2">
        <span className="absolute right-6 top-6 select-none text-8xl text-primary/10 transition-colors group-hover:text-primary/20">"</span>

        <div className="mb-8 flex items-center gap-4">
          <div className="size-14 rounded-full border border-primary/30 bg-primary/20 p-0.5">
            <AdaptiveAvatar
              src={item.avatar}
              alt={author}
              fallbackText={author}
              className="h-full w-full rounded-full object-cover text-sm"
              fallbackClassName="bg-slate-700"
            />
          </div>
          <div>
            <div className="text-xl font-black text-white">{company}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary">{role}</div>
          </div>
        </div>

        <p className="relative z-10 mb-8 text-lg font-medium leading-relaxed text-slate-300">
          "{item.quote}"
        </p>

        <div className="border-t border-slate-800 pt-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Batch: {batch}</span>
            <span>Reads: {reads}</span>
          </div>
          <div className="mt-2 text-xs font-bold text-primary">By {author}</div>
        </div>
      </article>
    </Link>
  );
}

export default function CommunitySection({ items = [] }) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-32">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-4xl font-black italic tracking-tight text-white md:text-5xl">Featured Interview Stories</h2>
          <div className="mx-auto h-1.5 w-24 rounded-full bg-primary" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.map((item) => (
            <CommunityCard key={item.uid || item.author} item={item} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/post" className="font-black text-primary hover:text-primary/80">
            Share your experience with the community
          </Link>
        </div>
      </div>
    </section>
  );
}
