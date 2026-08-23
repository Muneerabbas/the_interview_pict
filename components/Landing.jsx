'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { TALES_ENABLED } from "@/lib/feature-flags";
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Blocks,
  Bookmark,
  Building2,
  ChevronLeft,
  ChevronRight,
  Flame,
  GraduationCap,
  Lightbulb,
  PenLine,
  ShieldCheck,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Navbar from './Navbar'

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Real Experiences' },
  { icon: BadgeCheck, label: 'Verified Students' },
  { icon: Building2, label: 'Top Companies' },
  { icon: Lightbulb, label: 'Interview Tips' },
]

const DEPARTMENTS = [
  { key: 'CS', label: 'Computer Science' },
  { key: 'IT', label: 'Information Tech' },
  { key: 'EnTC', label: 'EnTC' },
  { key: 'AIDS', label: 'AI & Data Science' },
  { key: 'EC', label: 'Electronics' },
]

const COMPANIES = ['Barclays', 'Mastercard', 'BNY', 'Siemens', 'Arista', 'Tracelink', 'PhonePe']

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-blue-600',
]

const getAvatarColor = (seed = '') => {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

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

/* Horizontal scroller with edge controls — dashboard-style rail. */
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
        className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white sm:inline-flex"
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
        className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white sm:inline-flex"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

/* Section header — title left, optional action link right (Linear/Vercel pattern). */
const SectionHeader = ({ icon: Icon, title, description, ctaHref, ctaLabel }) => (
  <div className="flex flex-wrap items-end justify-between gap-3">
    <div className="max-w-2xl">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Icon size={15} />
          </span>
        ) : null}
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
    {ctaHref && ctaLabel ? (
      <Link
        href={ctaHref}
        prefetch
        className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {ctaLabel}
        <ArrowRight size={14} />
      </Link>
    ) : null}
  </div>
)

const StoryCard = ({ story }) => {
  const isTale = story?.content_type === 'tale'
  const plainText = stripToText(story?.exp_text || '')

  const seed = String(story?.uid || story?.company || story?.role || 'story')
  const avatarColor = getAvatarColor(seed)
  const authorLabel = story?.name || 'Anonymous'
  const headerTitle = isTale ? authorLabel : story?.company || 'Top Company'
  const headerSub = isTale ? story?.college || 'Tale' : story?.role || 'Interview'
  const cardTitle = isTale
    ? story?.title || 'Untitled Tale'
    : story?.title || `${story?.company || 'Company'} Interview Experience`
  const initial = headerTitle?.charAt(0)?.toUpperCase() || 'T'

  const batchBranch = [story?.branch, story?.batch].filter(Boolean).join(' · ')
  const chipLabel = isTale ? story?.category || 'Tale' : batchBranch || 'Interview Experience'
  const tags = Array.isArray(story?.tags) ? story.tags.filter(Boolean).slice(0, 3) : []

  return (
    <article className={`group flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 ${isTale ? 'border-l-2 border-l-emerald-500 dark:border-l-emerald-400' : ''}`}>
      <div className="flex items-center gap-3">
        <div
          className={`${avatarColor} flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold text-white`}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight text-slate-900 dark:text-white">
            {headerTitle}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{headerSub}</p>
        </div>
      </div>

      <h3 className="mt-4 line-clamp-1 text-[15px] font-semibold text-slate-900 dark:text-white">
        {cardTitle}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
        {plainText ||
          (isTale
            ? 'A personal story, project journey, and lessons from a real student.'
            : 'Practical preparation notes from real interview rounds.')}
      </p>

      <span className="mt-4 inline-flex w-fit max-w-full items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
        <span className="truncate">{chipLabel}</span>
      </span>
      {tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <span className="truncate text-xs text-slate-500 dark:text-slate-400">
          By <span className="font-semibold text-slate-700 dark:text-slate-200">{authorLabel}</span>
        </span>
        <Bookmark
          size={16}
          className="shrink-0 text-slate-300 transition group-hover:text-blue-500 dark:text-slate-600"
        />
      </div>
    </article>
  )
}

/* Filter group — company / batch / department chips. */
const FilterGroup = ({ icon: Icon, label, children }) => (
  <div className="flex flex-col gap-3 border-b border-slate-100 py-4 last:border-0 last:pb-0 dark:border-slate-800 sm:flex-row sm:items-center first:pt-0">
    <div className="flex w-full items-center gap-2 sm:w-44 sm:shrink-0">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon size={15} />
      </span>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
    </div>
    <div className="flex flex-1 flex-wrap gap-2">{children}</div>
  </div>
)

const chipClass =
  'rounded-md border border-slate-200 bg-white px-3 py-1 text-[13px] font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300'


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
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle={true} />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section id="hero" className="border-b border-slate-100 dark:border-slate-900">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-28 sm:pt-32 lg:grid-cols-2 lg:gap-6 lg:pb-16">
          {/* Left: copy + CTAs + trust badges */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.35rem]">
              Prepare Better.
              <br />
              <span className="text-blue-600 dark:text-blue-500">Perform</span> Confidently.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              Real interview experiences from students who cracked top companies.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/feed"
                prefetch
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
              >
                Read Stories
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/post"
                prefetch
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              >
                Share Your Story
                <PenLine size={15} />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-blue-400">
                    <Icon size={16} />
                  </span>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
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
              className="mx-auto h-auto w-full max-w-md lg:max-w-none"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ── Featured Stories ───────────────────────────────────── */}
      <section id="featured" className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-900 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <SectionHeader
            icon={Flame}
            title="Featured Interviews"
            description="Handpicked interview journeys from students who recently cracked top opportunities."
            ctaHref="/feed"
            ctaLabel="View all stories"
          />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {fetchedFeaturedStories.slice(0, 4).map((story, index) => (
              <Link
                key={`${story?.uid || 'featured'}-${index}`}
                href={`/single/${story.uid}`}
                prefetch
                className="block"
              >
                <StoryCard story={story} />
              </Link>
            ))}
          </div>

          {/* Resources banner */}
          <div className="mt-6 flex flex-col items-start gap-4 rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4 dark:border-blue-950/60 dark:bg-blue-950/20 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400">
                <GraduationCap size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  New to interviews?
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Read real experiences and company-specific insights to prepare.
                </p>
              </div>
            </div>
            <Link
              href="/feed"
              prefetch
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >
              Explore Resources
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Find experiences (company / batch / department) ────── */}
      <section id="companyspecific" className="border-y border-slate-100 bg-slate-50/60 dark:border-slate-900 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <SectionHeader
            icon={Building2}
            title="Find experiences that match your goal"
            description="Filter by company, batch, or branch and jump straight to the relevant interview patterns."
          />
          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <FilterGroup icon={Building2} label="By company">
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
            <FilterGroup icon={GraduationCap} label="By batch year">
              {batchYears.map((year) => (
                <Link key={year} href="/feed" prefetch className={chipClass}>
                  {year}
                </Link>
              ))}
            </FilterGroup>
            <FilterGroup icon={Blocks} label="By department">
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
      <section id="tales" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <SectionHeader
          icon={GraduationCap}
          title="Featured Tales"
          description="Project journeys, late-night fixes, and student stories beyond the interview room."
          ctaHref="/tales"
          ctaLabel="View all"
        />
        <div className="mt-6">
          <ScrollableSection>
            {fetchedTales.map((story, index) => (
              <Link
                key={`${story?.uid || 'tale'}-${index}`}
                href={`/single/${story.uid}`}
                prefetch
                className="block w-[290px] shrink-0"
              >
                <StoryCard story={story} />
              </Link>
            ))}
          </ScrollableSection>
        </div>
      </section>
      )}

      {/* ── Top Stories ────────────────────────────────────────── */}
      <section
        id="topstories"
        className="border-t border-slate-100 bg-slate-50/60 dark:border-slate-900 dark:bg-slate-900"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <SectionHeader
            icon={ArrowUpRight}
            title="Top Stories"
            description="The most-read experiences from the community, ranked by what helped candidates most."
            ctaHref="/feed"
            ctaLabel="View all"
          />
          <div className="mt-6">
            <ScrollableSection>
              {fetchedTopStories.map((story, index) => (
                <Link
                  key={`${story?.uid || 'top'}-${index}`}
                  href={`/single/${story.uid}`}
                  prefetch
                  className="block w-[290px] shrink-0"
                >
                  <StoryCard story={story} />
                </Link>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>
    </main>
  )
}
