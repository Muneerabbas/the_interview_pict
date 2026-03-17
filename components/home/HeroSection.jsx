import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-8 lg:py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(13,127,242,0.1)_0%,rgba(2,6,23,0)_68%)]" />
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Latest from Google, Meta and Stripe
        </div>

        <h1 className="mb-3 text-3xl font-extrabold leading-[1.12] tracking-tight text-white md:text-5xl lg:text-6xl">
          Learn From Real{" "}
          <span className="text-primary [text-shadow:0_0_16px_rgba(13,127,242,0.2)]">Interview Stories</span>
        </h1>

        <p className="mx-auto mb-5 max-w-2xl text-base font-normal leading-relaxed text-slate-300 md:text-lg">
          Honest, practical experiences from candidates so you can prepare with clarity and confidence.
        </p>

        <div className="flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Link
            href="/feed"
            className="w-full rounded-full bg-primary px-6 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto"
          >
            Explore Stories
          </Link>
          <Link
            href="/post"
            className="w-full rounded-full border border-slate-700 bg-slate-900/50 px-6 py-2.5 text-center text-sm font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800/70 sm:w-auto"
          >
            Share Your Journey
          </Link>
        </div>
      </div>
    </section>
  );
}
