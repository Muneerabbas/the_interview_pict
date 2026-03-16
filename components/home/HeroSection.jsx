import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(13,127,242,0.15)_0%,rgba(2,6,23,0)_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Latest from Google, Meta and Stripe
        </div>

        <h1 className="mb-8 text-5xl font-black leading-[1.05] tracking-tighter text-white md:text-7xl lg:text-8xl">
          Crack Your Next <br className="hidden md:block" />
          <span className="italic text-primary [text-shadow:0_0_30px_rgba(13,127,242,0.3)]">Interview Story</span>
        </h1>

        <p className="mx-auto mb-12 max-w-3xl text-xl font-medium leading-relaxed text-slate-400">
          Unfiltered firsthand experiences from candidates at leading tech companies, with practical preparation signals that actually matter.
        </p>

        <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            href="/feed"
            className="w-full rounded-full bg-primary px-10 py-5 text-center text-lg font-black text-white shadow-2xl shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/40 sm:w-auto"
          >
            Explore Stories
          </Link>
          <Link
            href="/post"
            className="w-full rounded-full border border-white/10 bg-white/5 px-10 py-5 text-center text-lg font-black text-white transition-all hover:bg-white/10 sm:w-auto"
          >
            Share Your Journey
          </Link>
        </div>
      </div>
    </section>
  );
}
