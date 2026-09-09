'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { TALES_ENABLED } from "@/lib/feature-flags";
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  PenLine,
  ShieldCheck,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Navbar from './Navbar'
import { isPlacementHost } from '@/lib/host-gate'

/* The pastel pairs are literal in the design file (they sit on both themes
   unchanged), so they stay literal here rather than becoming theme tokens. */
const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Real Experiences', bg: '#CDC6F7', fg: '#241E5C' },
  { icon: BadgeCheck, label: 'Verified Students', bg: '#BCE7CF', fg: '#0C3A26' },
  { icon: Building2, label: 'Top Companies', bg: '#FFD9A8', fg: '#5A3A0B' },
  { icon: Lightbulb, label: 'Interview Tips', bg: '#FFD3C7', fg: '#7A2A12' },
]

const DEPARTMENTS = [
  { key: 'CS', label: 'Computer Science' },
  { key: 'IT', label: 'Information Tech' },
  { key: 'EnTC', label: 'EnTC' },
  { key: 'AIDS', label: 'AI & Data Science' },
  { key: 'EC', label: 'Electronics' },
]

const COMPANIES = ['Barclays', 'Mastercard', 'BNY', 'Siemens', 'Arista', 'Tracelink', 'PhonePe']

const stripToText = (raw = '') => {
  let text = raw.replace(/<[^>]*>?/g, ' ')
  text = text.replace(/\*\*|__/g, '')
  text = text.replace(/\*/g, '')
  text = text.replace(/_/g, '')
  text = text.replace(/^#{1,6}\s/gm, '')
  text = text.replace(/^[\s]*[*+-]\s/gm, '')
  text = text.replace(/^[\s]*\d+\.\s/gm, '')
  text = text.replace(/^>\s/gm, '')
  text = text.replace(/`([^`]+)`/g, '$1')
  text = text.replace(/^[-*_]{3,}$/gm, '')
  text = text.replace(/[\r\n]+/g, ' ').trim()
  return text
}

/* The design prints reads as "2.4k". Anything under a thousand stays exact, and
   a post with no views yet prints nothing rather than a fake "0". */
const formatReads = (views) => {
  const n = Number(views) || 0
  if (n <= 0) return ''
  if (n < 1000) return `${n}`
  return `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, '')}k`
}

const initialOf = (value = '') => value.trim().charAt(0).toUpperCase() || 'T'

/* Horizontal scroller with edge controls — the design's plain rail, plus the
   arrows this page already had. */
const ScrollableSection = ({ children }) => {
  const scrollContainerRef = useRef(null)

  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (!container) return
    const scrollAmount = Math.min(container.offsetWidth, 640)
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100 sm:inline-flex"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100 sm:inline-flex"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

/* Section header — title left, optional action link right. */
const SectionHeader = ({ title, description, ctaHref, ctaLabel }) => (
  <div className="flex flex-wrap items-end justify-between gap-5">
    <div className="max-w-2xl">
      <h2 className="font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.04em] text-slate-900 dark:text-slate-100 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2.5 text-[15.5px] leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
    {ctaHref && ctaLabel ? (
      <Link
        href={ctaHref}
        prefetch
        className="shrink-0 whitespace-nowrap text-[14.5px] font-bold text-primary transition hover:opacity-80"
      >
        {ctaLabel} →
      </Link>
    ) : null}
  </div>
)

const cardClass =
  'flex h-full flex-col rounded-[18px] border border-slate-200 bg-white p-[22px] transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-800'
const monoClass =
  'font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500'
const footerClass =
  'mt-5 flex items-center gap-2.5 border-t border-black/[0.06] pt-[15px] dark:border-white/[0.07]'
const avatarClass =
  'flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-slate-100 text-[13px] font-bold text-slate-700 dark:bg-white/[0.07] dark:text-slate-300'

/* Interview card — the design's featured grid tile. */
const InterviewCard = ({ story }) => {
  const company = story?.company || 'Top Company'
  const author = story?.name || 'Anonymous'
  const meta = [story?.batch, story?.branch].filter(Boolean).join(' · ') || 'Interview Experience'
  const badge = Array.isArray(story?.tags) ? story.tags.filter(Boolean)[0] : ''
  const reads = formatReads(story?.views)

  return (
    <article className={cardClass}>
      <div className="flex items-center justify-between gap-2.5">
        <span className={`${monoClass} truncate`}>{meta}</span>
        {badge ? (
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-[#EEF1E0] px-2.5 py-1 text-[11px] font-bold text-[#3C4410] dark:bg-[#2C3316] dark:text-[#D8F14E]">
            {badge}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3.5 font-display text-[19px] font-bold leading-[1.24] tracking-[-0.025em] text-slate-900 dark:text-slate-100">
        {company}
      </h3>
      <div className="mt-1.5 truncate text-[13.5px] text-slate-500">{story?.role || 'Interview'}</div>
      <p className="mt-3.5 line-clamp-3 flex-1 text-[14.5px] leading-[1.58] text-slate-600 dark:text-slate-400">
        {stripToText(story?.exp_text || '') || 'Practical preparation notes from real interview rounds.'}
      </p>
      <div className={footerClass}>
        <span className={avatarClass}>{initialOf(author)}</span>
        <span className="truncate text-[13.5px] font-semibold text-slate-700 dark:text-slate-300">
          {author}
        </span>
        {reads ? (
          <span className="ml-auto shrink-0 font-mono text-[11.5px] text-slate-500">{reads}</span>
        ) : null}
      </div>
    </article>
  )
}

/* Tale card — mint spine, title-led, author + college in the footer. */
const TaleCard = ({ story }) => {
  const author = story?.name || 'Anonymous'

  return (
    <article className={`${cardClass} border-l-[3px] border-l-[#7FC7A4] dark:border-l-[#7FC7A4]`}>
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#4E7C63] dark:text-[#8FD9B4]">
        {story?.category || 'Tale'}
      </span>
      <h3 className="mt-3.5 line-clamp-2 font-display text-[18px] font-bold leading-[1.28] tracking-[-0.025em] text-slate-900 dark:text-slate-100">
        {story?.title || 'Untitled Tale'}
      </h3>
      <p className="mt-3 line-clamp-3 flex-1 text-[14.5px] leading-[1.58] text-slate-600 dark:text-slate-400">
        {stripToText(story?.exp_text || '') ||
          'A personal story, project journey, and lessons from a real student.'}
      </p>
      <div className={footerClass}>
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#E3F3EA] text-[13px] font-bold text-[#0F4A31] dark:bg-[#1D3329] dark:text-[#8FD9B4]">
          {initialOf(author)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-semibold text-slate-700 dark:text-slate-300">
            {author}
          </div>
          <div className="truncate text-[12px] text-slate-500">{story?.college || 'Tale'}</div>
        </div>
      </div>
    </article>
  )
}

/* Top story card — ranked, reads-led, title-led. */
const TopStoryCard = ({ story, rank }) => {
  const author = story?.name || 'Anonymous'
  const reads = formatReads(story?.views)
  const sub = [story?.company, story?.batch].filter(Boolean).join(' · ')

  return (
    <article className={cardClass}>
      <div className="flex items-center justify-between gap-2.5">
        <span className={monoClass}>{String(rank).padStart(2, '0')}</span>
        {reads ? <span className="font-mono text-[11.5px] text-slate-500">{reads}</span> : null}
      </div>
      <h3 className="mt-3.5 line-clamp-2 font-display text-[18px] font-bold leading-[1.28] tracking-[-0.025em] text-slate-900 dark:text-slate-100">
        {story?.title || `${story?.company || 'Company'} Interview Experience`}
      </h3>
      <p className="mt-3 line-clamp-3 flex-1 text-[14.5px] leading-[1.58] text-slate-600 dark:text-slate-400">
        {stripToText(story?.exp_text || '') || 'Practical preparation notes from real interview rounds.'}
      </p>
      <div className={footerClass}>
        <span className={avatarClass}>{initialOf(author)}</span>
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-semibold text-slate-700 dark:text-slate-300">
            {author}
          </div>
          {sub ? <div className="truncate text-[12px] text-slate-500">{sub}</div> : null}
        </div>
      </div>
    </article>
  )
}

/* Filter row — label left, chips right, hairline between rows. */
const FilterGroup = ({ label, children }) => (
  <div className="grid gap-3 border-b border-black/[0.06] px-[22px] py-[18px] last:border-0 dark:border-white/[0.07] sm:grid-cols-[minmax(150px,190px)_1fr] sm:items-center sm:gap-[18px]">
    <span className="text-[14.5px] font-bold text-slate-700 dark:text-slate-300">{label}</span>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
)

const chipClass =
  'inline-flex rounded-full border border-slate-200 bg-slate-50 px-3.5 py-[7px] text-[13.5px] font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:hover:border-white/25 dark:hover:text-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400'

/**
 * `sort(() => Math.random() - 0.5)` is a biased shuffle, not a fair one. These
 * run in effects, so the server-rendered order paints first and then visibly
 * reshuffles on hydration -- a content jump and needless CLS on the landing page.
 * Fisher-Yates, applied once per data change.
 */
function shuffle(items) {
  if (!Array.isArray(items)) return [];
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function Home({ tales, featuredStories, topStories, topCompanies = [] }) {
  // Placements is a pict.live-only surface. Resolved after mount from the
  // browser's own hostname: this page is prerendered (revalidate = 1800), and
  // reading headers() here would turn it server-rendered, which commit 5fe582d
  // exists to prevent. Defaults to hidden so theinterviewroom.in never flashes it.
  const [isPlacementSite, setIsPlacementSite] = useState(false)
  useEffect(() => {
    setIsPlacementSite(isPlacementHost(window.location.hostname))
  }, [])

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [fetchedFeaturedStories, setFetchedFeaturedStories] = useState(featuredStories || [])
  const [fetchedTales, setFetchedTales] = useState(tales || [])
  const [fetchedTopStories, setFetchedTopStories] = useState(topStories || [])

  const batchYears = useMemo(() => Array.from({ length: 2027 - 2019 }, (_, i) => 2027 - i), [])

  useEffect(() => {
    if (mounted) {
      document.body.classList.toggle('landing-light', resolvedTheme !== 'dark')
    }
  }, [resolvedTheme, mounted])

  useEffect(() => {
    setFetchedTales(shuffle(tales))
  }, [tales])

  useEffect(() => {
    setFetchedFeaturedStories(shuffle(featuredStories))
  }, [featuredStories])

  useEffect(() => {
    setFetchedTopStories(shuffle(topStories))
  }, [topStories])

  useEffect(() => {
    return () => {
      document.body.classList.remove('landing-light')
    }
  }, [])

  return (
    <main className="min-h-screen bg-custom-cream text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle={true} />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section id="hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-28 sm:pt-32 lg:grid-cols-2 lg:pb-16">
          {/* Left: copy + CTAs + trust badges */}
          <div className="max-w-xl">
            <h1 className="font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-[52px]">
              Prepare Better.
              <br />
              <span className="text-primary">Perform</span> Confidently.
            </h1>
            <p className="mt-4 max-w-[430px] text-[17px] leading-[1.55] text-slate-600 dark:text-slate-400">
              Real interview experiences from students who cracked top companies.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                href="/feed"
                prefetch
                className="inline-flex h-[46px] items-center justify-center gap-2.5 rounded-full bg-primary px-[22px] text-[15.5px] font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
              >
                Read Stories
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/post"
                prefetch
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-full bg-slate-900 px-[22px] text-[15.5px] font-semibold text-custom-cream transition hover:opacity-90 active:scale-[0.98] dark:bg-slate-100 dark:text-slate-950"
              >
                Share Your Story
                <PenLine size={15} />
              </Link>
              {isPlacementSite ? (
                <Link
                  href="/placements"
                  prefetch
                  className="inline-flex h-[46px] items-center justify-center gap-2 rounded-full bg-[#D8F14E] px-[22px] text-[15.5px] font-bold text-[#14161C] transition hover:opacity-90 active:scale-[0.98]"
                >
                  Placement Stats
                  <BarChart3 size={15} />
                </Link>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-[26px] gap-y-3">
              {TRUST_BADGES.map(({ icon: Icon, label, bg, fg }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                    style={{ backgroundColor: bg, color: fg }}
                  >
                    <Icon size={16} strokeWidth={2.2} />
                  </span>
                  <span className="text-[14.5px] font-semibold text-slate-700 dark:text-slate-300">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: illustration */}
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-illustration.svg"
              alt="Student preparing for an interview"
              className="mx-auto h-auto w-full max-w-[430px] lg:max-w-none"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ── Featured Stories ───────────────────────────────────── */}
      <section id="featured" className="border-t border-slate-200 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-11 sm:py-14">
          <SectionHeader
            title="Featured Interviews"
            description="Handpicked interview journeys from students who recently cracked top opportunities."
            ctaHref="/feed"
            ctaLabel="View all stories"
          />
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {fetchedFeaturedStories.slice(0, 4).map((story, index) => (
              <Link
                key={`${story?.uid || 'featured'}-${index}`}
                href={`/single/${story.uid}`}
                prefetch
                className="block"
              >
                <InterviewCard story={story} />
              </Link>
            ))}
          </div>

          {/* Resources banner */}
          <div className="mt-4 flex flex-col items-start gap-5 rounded-[18px] bg-[#CDC6F7] px-6 py-[22px] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#241E5C] text-[#CDC6F7]">
                <GraduationCap size={20} />
              </span>
              <div>
                <p className="font-display text-[17px] font-extrabold tracking-[-0.025em] text-[#241E5C]">
                  New to interviews?
                </p>
                <p className="mt-0.5 text-[14.5px] text-[#3B3480]">
                  Read real experiences and company-specific insights to prepare.
                </p>
              </div>
            </div>
            <Link
              href="/feed"
              prefetch
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#241E5C] px-[22px] text-[14.5px] font-semibold text-white transition hover:opacity-90"
            >
              Explore Resources
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Find experiences (company / batch / department) ────── */}
      <section
        id="companyspecific"
        className="border-t border-slate-200 bg-muted dark:border-white/10"
      >
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="max-w-3xl font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.04em] text-slate-900 dark:text-slate-100 sm:text-4xl">
            Find experiences that match your goal
          </h2>
          <p className="mt-2.5 max-w-[640px] text-[15.5px] leading-relaxed text-slate-600 dark:text-slate-400">
            Filter by company, batch, or branch and jump straight to the relevant interview patterns.
          </p>
          <div className="mt-6 overflow-hidden rounded-[18px] border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-800">
            <FilterGroup label="By company">
              {/* Each chip opens ITS OWN company page. These come from the DB, so
                  the slug always resolves; the hardcoded list is only a fallback
                  for an empty database and points at the directory. */}
              {topCompanies.length > 0
                ? topCompanies.map((company) => (
                  <Link key={company.slug} href={`/companies/${company.slug}`} prefetch className={chipClass}>
                    {company.name}
                  </Link>
                ))
                : COMPANIES.map((company) => (
                  <Link key={company} href="/companies" prefetch className={chipClass}>
                    {company}
                  </Link>
                ))}
            </FilterGroup>
            <FilterGroup label="By batch year">
              {batchYears.map((year) => (
                <Link key={year} href="/feed" prefetch className={`${chipClass} font-mono`}>
                  {year}
                </Link>
              ))}
            </FilterGroup>
            <FilterGroup label="By department">
              {DEPARTMENTS.map((dept) => (
                <Link key={dept.key} href="/feed" prefetch className={chipClass}>
                  {dept.label}
                </Link>
              ))}
            </FilterGroup>
          </div>
        </div>
      </section>

      {/* ── Featured Tales (hidden until Tales ships) ──────────── */}
      {TALES_ENABLED && (
      <section id="tales" className="border-t border-slate-200 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeader
            title="Featured Tales"
            description="Project journeys, late-night fixes, and student stories beyond the interview room."
            ctaHref="/tales"
            ctaLabel="View all"
          />
          <div className="mt-7">
            <ScrollableSection>
              {fetchedTales.map((story, index) => (
                <Link
                  key={`${story?.uid || 'tale'}-${index}`}
                  href={`/single/${story.uid}`}
                  prefetch
                  className="block w-[300px] shrink-0"
                >
                  <TaleCard story={story} />
                </Link>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>
      )}

      {/* ── Top Stories ────────────────────────────────────────── */}
      <section
        id="topstories"
        className="border-t border-slate-200 bg-muted dark:border-white/10"
      >
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeader
            title="Top Stories"
            description="The most-read experiences from the community, ranked by what helped candidates most."
            ctaHref="/feed"
            ctaLabel="View all"
          />
          <div className="mt-7">
            <ScrollableSection>
              {fetchedTopStories.map((story, index) => (
                <Link
                  key={`${story?.uid || 'top'}-${index}`}
                  href={`/single/${story.uid}`}
                  prefetch
                  className="block w-[300px] shrink-0"
                >
                  <TopStoryCard story={story} rank={index + 1} />
                </Link>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>
    </main>
  )
}
