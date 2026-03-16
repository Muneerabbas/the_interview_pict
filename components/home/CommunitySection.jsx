import Link from "next/link";
import AdaptiveAvatar from "./AdaptiveAvatar";

function CommunityCard({ item }) {
  return (
    <article className="group relative rounded-[2.5rem] border border-slate-800 bg-slate-900 p-10 transition-transform duration-500 hover:-translate-y-2">
      <span className="absolute right-6 top-6 select-none text-8xl text-primary/10 transition-colors group-hover:text-primary/20">"</span>
      <p className="relative z-10 mb-10 text-lg font-medium leading-relaxed text-slate-300">
        "{item.quote}"
      </p>
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-full border border-primary/30 bg-primary/20 p-0.5">
          <AdaptiveAvatar
            src={item.avatar}
            alt={item.author}
            fallbackText={item.author}
            className="h-full w-full rounded-full object-cover text-sm"
            fallbackClassName="bg-slate-700"
          />
        </div>
        <div>
          <div className="font-black text-white">{item.author}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            {item.role} at {item.company}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CommunitySection({ items = [] }) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-32">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-4xl font-black italic tracking-tight text-white md:text-5xl">Community Impact</h2>
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
