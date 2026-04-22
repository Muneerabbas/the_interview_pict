'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import logo from '../public/app_icon.png'
import { CanvasText } from "@/components/ui/canvas-text";
import TypingSentence from "@/components/TypingSentence";
import {
  ArrowRight,
  Blocks,
  Building2,
  ChevronLeft,
  ChevronRight,
  Flame,
  GraduationCap,
  Menu,
  MessageSquareText,
  Quote,
  Search,
  Sparkles,
  X,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from "next-themes"
import ThemeToggle from "./ThemeToggle"

const NAV_ITEMS = [
  { href: '/', label: 'Home', sectionId: 'hero' },
  { href: '/companies', label: 'Companies', sectionId: 'companies' },
  { href: '/feed', label: 'Feed', sectionId: 'feed' },
  { href: '#tales', label: 'Hackathons', sectionId: 'tales' },
  { href: '#topstories', label: 'Top Stories', sectionId: 'topstories' },
  { href: '#companyspecific', label: 'Search Experience', sectionId: 'companyspecific' },
  { href: '/post', label: 'Share Experience', sectionId: 'share' },
  { href: '/about', label: 'About Us', sectionId: 'about' },
]

const BLOG_POSTS = [
  {
    author: 'Siddhant Vishnu',
    content: '"Unbelievable stuff from seniors. Could not ask for more."',
    avatarBg: 'bg-emerald-500',
    avatar: 'S',
  },
  {
    author: 'Shlok S',
    content: '"Bro, now placement prep finally feels manageable."',
    avatarBg: 'bg-orange-500',
    avatar: 'S',
  },
  {
    author: 'Shreya Hiwarkar',
    content: '"Great work, super helpful and easy to follow."',
    avatarBg: 'bg-sky-500',
    avatar: 'S',
  },
]

const DEPARTMENTS = [
  { key: 'CS', label: 'Computer Science' },
  { key: 'IT', label: 'Information Tech' },
  { key: 'EnTC', label: 'EnTC' },
  { key: 'AIDS', label: 'AI & Data Science' },
  { key: 'EC', label: 'Electronics' },
]

const COMPANIES = ['Barclays', 'Mastercard', 'BNY', 'Siemens', 'Arista', 'Tracelink', 'PhonePe']

const AVATAR_COLORS = ['bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500']

const getAvatarColor = (seed = '') => {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const ScrollableSection = ({ children }) => {
  const scrollContainerRef = useRef(null)

  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.offsetWidth
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute -left-5 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300/90 bg-white/95 text-slate-700 shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition hover:scale-105 hover:border-cyan-300/60 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_16px_30px_rgba(2,6,23,0.72)] dark:hover:border-cyan-500/55 dark:hover:text-cyan-200 sm:inline-flex"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto scroll-smooth px-1 py-1 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute -right-5 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300/90 bg-white/95 text-slate-700 shadow-[0_14px_28px_rgba(15,23,42,0.18)] transition hover:scale-105 hover:border-cyan-300/60 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[0_16px_30px_rgba(2,6,23,0.72)] dark:hover:border-cyan-500/55 dark:hover:text-cyan-200 sm:inline-flex"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

const SectionHeader = ({ title, description, ctaHref, ctaLabel, align = 'center' }) => {
  const isLeftAligned = align === 'left'
  return (
    <div className={isLeftAligned ? 'text-left' : 'text-center'}>
      <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">{title}</h2>
      <p className={cn('mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base', isLeftAligned ? '' : 'mx-auto')}>{description}</p>
      {ctaHref && ctaLabel && (
        <div className="mt-5">
          <Link
            href={ctaHref}
            prefetch={true}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
          >
            {ctaLabel}
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  )
}

const StoryCard = ({ story }) => {
  const isTale = story?.content_type === 'tale'
  let plainText = story?.exp_text || ''
  plainText = plainText.replace(/<[^>]*>?/g, ' ') /* Strip HTML tags inserted by rich text editors */
  plainText = plainText.replace(/\*\*|__/g, '')
  plainText = plainText.replace(/\*/g, '')
  plainText = plainText.replace(/_/g, '')
  plainText = plainText.replace(/^#{1,6}\s/gm, '')
  plainText = plainText.replace(/^[\s]*[*+-]\s/gm, '')
  plainText = plainText.replace(/^[\s]*\d+\.\s/gm, '')
  plainText = plainText.replace(/^>\s/gm, '')
  plainText = plainText.replace(/`([^`]+)`/g, '$1')
  plainText = plainText.replace(/^[-*_]{3,}$/gm, '')
  plainText = plainText.replace(/[\r\n]+/g, ' ').trim()

  const bullets = plainText
    .split(/[.!?]\s+/g)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, 2)

  const seed = String(story?.uid || story?.company || story?.role || 'story')
  const avatarColor = getAvatarColor(seed)
  const primaryLabel = isTale ? (story?.title || 'Untitled Tale') : (story?.company || 'Top Company')
  const secondaryLabel = isTale ? (story?.college || 'Tale') : (story?.role || 'Interview Experience')
  const authorLabel = story?.name || 'Anonymous'

  return (
    <article className="min-w-[300px] max-w-[360px] rounded-2xl border border-slate-300/90 bg-white/90 p-6 shadow-[0_14px_32px_rgba(15,23,42,0.11)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300/50 hover:shadow-[0_18px_34px_rgba(59,130,246,0.18)] dark:border-slate-700 dark:!bg-slate-950/95 dark:shadow-[0_16px_34px_rgba(2,6,23,0.78)] dark:hover:border-cyan-500/45 dark:hover:shadow-[0_18px_34px_rgba(8,145,178,0.3)]">
      {isTale ? (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`${avatarColor} flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white`}
              aria-hidden="true"
            >
              {authorLabel?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-bold leading-tight text-slate-900 dark:text-slate-100">{authorLabel}</p>
              <p className="truncate text-xs font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Tale</p>
            </div>
          </div>
          <Quote size={18} className="shrink-0 fill-slate-300 text-slate-300 opacity-[0.12] dark:fill-slate-500 dark:text-slate-500" />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`${avatarColor} flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white`}
              aria-hidden="true"
            >
              {story?.name?.charAt(0)?.toUpperCase() || primaryLabel?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">{primaryLabel}</p>
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-300">{secondaryLabel}</p>
            </div>
          </div>
          <Quote size={18} className="shrink-0 fill-slate-300 text-slate-300 opacity-[0.12] dark:fill-slate-500 dark:text-slate-500" />
        </div>
      )}

      <div className="relative mt-4 space-y-2 text-left">
        {isTale ? (
          <>
            <h3 className="line-clamp-2 text-[15px] font-black leading-snug text-slate-900 dark:text-slate-50 sm:text-[1.15rem]">
              {primaryLabel}
            </h3>
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50/80 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:border-cyan-500/25 dark:bg-cyan-950/35 dark:text-cyan-300">
              <GraduationCap size={12} className="shrink-0" />
              <span className="truncate">{secondaryLabel}</span>
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-200 sm:text-[15px]">
              {plainText || 'Personal story, project journey, and lessons from a real student tale.'}
            </p>
          </>
        ) : bullets.length > 0 ? (
          <>
            <p className="line-clamp-1 text-[15px] font-semibold leading-relaxed text-slate-800 dark:text-slate-50 sm:text-base">
              {bullets[0]}
            </p>
            {bullets[1] ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-200 sm:text-[15px]">
                {bullets[1]}
              </p>
            ) : null}
          </>
        ) : (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-200 sm:text-[15px]">{plainText || 'Practical preparation tips from real rounds and real candidates.'}</p>
        )}
        {/* Gradient fade-out on text */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/80 to-transparent dark:from-slate-950/95" />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200/90 pt-4 dark:border-slate-700/80">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
          {story?.views ?? 0}
        </span>
        <span className="group inline-flex items-center gap-1 text-[14px] font-bold text-blue-700 transition-all hover:gap-1.5 dark:text-cyan-200">
          Read story
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  )
}

export default function Home({ tales, topStories }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDarkMode = mounted && resolvedTheme === 'dark'

  const [fetchedTales, setFetchedTales] = useState(tales || [])
  const [fetchedTopStories, setFetchedTopStories] = useState(topStories || [])
  const [activeSection, setActiveSection] = useState('Home')

  const mobileMenuRef = useRef(null)
  const mobileMenuButtonRef = useRef(null)

  const batchYears = useMemo(() => Array.from({ length: 2027 - 2019 }, (_, i) => 2027 - i), [])



  useEffect(() => {
    if (mounted) {
      document.body.classList.toggle('landing-light', resolvedTheme !== 'dark')
    }
  }, [resolvedTheme, mounted])

  useEffect(() => {
    if (Array.isArray(tales)) {
      const shuffled = [...tales].sort(() => Math.random() - 0.5);
      setFetchedTales(shuffled);
    } else {
      setFetchedTales([]);
    }
  }, [tales])

  useEffect(() => {
    if (Array.isArray(topStories)) {
      const shuffled = [...topStories].sort(() => Math.random() - 0.5);
      setFetchedTopStories(shuffled);
    } else {
      setFetchedTopStories([]);
    }
  }, [topStories])

  useEffect(() => {
    return () => {
      document.body.classList.remove('landing-light')
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !(mobileMenuButtonRef.current && mobileMenuButtonRef.current.contains(event.target))
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map((item) => document.getElementById(item.sectionId)).filter(Boolean)
      let currentSection = 'Home'

      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 150 && rect.bottom >= 150) {
          currentSection = NAV_ITEMS.find((item) => item.sectionId === section.id)?.label || currentSection
          break
        }
      }

      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_14%_14%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.18),transparent_36%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_14%_14%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(99,102,241,0.2),transparent_36%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.45),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.05),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(2,6,23,0.82),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-60 dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.28)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.28)_1px,transparent_1px)] dark:opacity-45" />
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/65 dark:border-slate-800/80 dark:bg-slate-950/80 dark:shadow-[0_10px_30px_rgba(2,6,23,0.55)]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="hidden items-center justify-between lg:flex">
            <Link href="/" prefetch={true} className="group flex items-center gap-2.5 font-semibold tracking-tight text-slate-900 transition-all dark:text-slate-100">
              <div className="relative flex items-center justify-center transition-transform group-hover:scale-105">
                <Image src={logo} alt="theInterview Logo" width={46} height={46} priority />
              </div>
              <span className="text-xl font-bold">
                the<span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Interview</span>Room
              </span>
            </Link>

            <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/75 p-1.5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/75">
              {NAV_ITEMS.filter((item) => item.label !== 'Search Experience' && item.label !== 'Share Experience').map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={[
                    'rounded-xl px-3.5 py-2 text-sm font-semibold transition',
                    activeSection === item.label
                      ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 shadow-sm dark:from-cyan-950/45 dark:to-blue-950/45 dark:text-cyan-300 dark:shadow-cyan-950/30'
                      : 'text-slate-600 hover:bg-cyan-50/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[0.5px] hover:border-cyan-300/50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-slate-100"
              >
                <Search size={17} className="text-slate-500 dark:text-slate-400" />
                Search
              </Link>
              <Link
                href="/post"
                prefetch={true}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:-translate-y-[0.5px] hover:from-blue-500 hover:to-indigo-400 dark:shadow-indigo-500/20"
              >
                Share Experience
              </Link>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="flex items-center justify-between">
              <Link href="/" prefetch={true} className="group flex items-center gap-2 font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                <div className="relative flex items-center justify-center transition-transform">
                  <Image src={logo} alt="theInterview Logo" width={42} height={42} priority />
                </div>
                <span className="text-base font-bold sm:text-lg">
                  the<span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Interview</span>Room
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setIsMobileMenuOpen((open) => !open)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/80 bg-white/90 text-slate-700 shadow-sm transition hover:border-cyan-300/50 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                  ref={mobileMenuButtonRef}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {isMobileMenuOpen && (
              <div
                className="absolute left-0 right-0 top-full border-b border-slate-200/80 bg-white/95 shadow-[0_18px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-[0_18px_36px_rgba(2,6,23,0.65)]"
                ref={mobileMenuRef}
              >
                <div className="space-y-1 p-3">
                  <Link
                    href="/search"
                    className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-200/60 hover:bg-cyan-50/60 dark:text-slate-200 dark:hover:border-cyan-500/30 dark:hover:bg-slate-800/80"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Search size={18} className="text-slate-500 dark:text-slate-400" />
                    Search
                  </Link>

                  {NAV_ITEMS.filter((item) => item.label !== 'Search Experience' && item.label !== 'Share Experience').map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className={[
                        'block rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                        activeSection === item.label
                          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 dark:from-cyan-950/45 dark:to-blue-950/45 dark:text-cyan-300'
                          : 'text-slate-700 hover:bg-cyan-50 dark:text-slate-200 dark:hover:bg-slate-800/80',
                      ].join(' ')}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <Link
                    href="/post"
                    prefetch={true}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:from-blue-500 hover:to-indigo-400 dark:shadow-indigo-500/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Share Experience
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <section id="hero" className="relative overflow-hidden px-4 pb-24 pt-28 sm:pb-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,#EFF3FF_0%,#F4F6FB_55%,transparent_80%),linear-gradient(to_right,rgba(148,163,184,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.3)_1px,transparent_1px)] bg-[size:auto,46px_46px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)] dark:bg-[size:46px_46px]" />
        <div className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/25" />
        <div className="pointer-events-none absolute -right-12 top-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl dark:bg-cyan-500/25" />

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="group mx-auto flex w-fit items-center justify-center mb-1 sm:mb-2">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-40 md:w-40 transition-transform duration-500 hover:scale-105">
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl transition duration-500 group-hover:bg-blue-600/20 dark:bg-cyan-500/10 dark:group-hover:bg-cyan-400/20" />
              <Image
                src={logo}
                alt="theInterviewRoom Logo"
                fill
                sizes="(max-width: 768px) 128px, 160px"
                className="relative object-contain drop-shadow-lg transition-all duration-500 group-hover:drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          <h2
            className={cn(
              "group relative w-full flex flex-row flex-wrap md:flex-nowrap items-center justify-center gap-x-2 sm:gap-x-3 md:gap-x-4 text-center text-4xl leading-[1.1] font-bold tracking-tight text-slate-700 sm:text-5xl md:text-6xl xl:text-[4.75rem] dark:text-slate-100",
            )}
          >
            <span>The</span>
            <CanvasText
              text="Interview"
              backgroundClassName="bg-blue-600 dark:bg-blue-700"
              colors={[
                "rgba(0, 153, 255, 1)",
                "rgba(0, 153, 255, 0.9)",
                "rgba(0, 153, 255, 0.8)",
                "rgba(0, 153, 255, 0.7)",
                "rgba(0, 153, 255, 0.6)",
                "rgba(0, 153, 255, 0.5)",
                "rgba(0, 153, 255, 0.4)",
                "rgba(0, 153, 255, 0.3)",
                "rgba(0, 153, 255, 0.2)",
                "rgba(0, 153, 255, 0.1)",
              ]}
              lineGap={4}
              animationDuration={20}
            />
            <span>Room</span>
          </h2>
          <TypingSentence />

          <div className="mt-8 flex flex-row items-center justify-center gap-3">
            {/* PRIMARY: Read Stories — filled accent blue */}
            <Link
              href="/feed"
              prefetch={true}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-[13.5px] font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.35)] transition hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-[0_18px_34px_rgba(37,99,235,0.45)] active:scale-95 sm:flex-none sm:text-sm"
            >
              <span className="truncate whitespace-nowrap">Read Stories</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            {/* SECONDARY: Share Your Story — outlined */}
            <Link
              href="/post"
              prefetch={true}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 bg-white/88 px-7 py-3 text-[13.5px] font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-white hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-blue-500/60 dark:hover:text-blue-300 active:scale-95 sm:flex-none sm:text-sm"
            >
              <span className="truncate whitespace-nowrap">Share Your Story</span>
            </Link>
          </div>

        </div>
      </section>

      <section id="tales" className="relative px-4 pb-20 pt-4 sm:pb-24">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-300/85 bg-white/90 px-4 py-9 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/85 dark:shadow-[0_16px_38px_rgba(2,6,23,0.62)] sm:px-8 sm:py-11">
          <SectionHeader
            icon={Sparkles}
            eyebrow="Hackathons"
            title="Student Hackathons"
            description="Project journeys, event stories, and student experiences beyond interview prep."
            ctaHref="/tales"
            ctaLabel="View all hackathons"
          />

          <div className="mt-10">
            <ScrollableSection>
              {fetchedTales.map((story, index) => (
                <Link key={`${story?.uid || 'tale'}-${index}`} href={`/single/${story.uid}`} prefetch={true} className="block h-full">
                  <StoryCard story={story} />
                </Link>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>

      <section id="companyspecific" className="relative px-4 py-14 sm:py-16">
        <div className="pointer-events-none absolute right-0 top-14 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/15" />
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-300/85 bg-white/85 px-4 py-8 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/85 dark:shadow-[0_16px_38px_rgba(2,6,23,0.62)] sm:px-8 sm:py-10">
          <SectionHeader
            icon={Search}
            eyebrow="Search Smarter"
            title="Find Experiences That Match Your Goal"
            description="Filter by company, batch, or branch and jump straight to relevant interview patterns."
          />

          <div className="mt-8 space-y-4">
            {/* -- Company filter -- */}
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-3.5 shadow-lg shadow-slate-200/80 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-slate-950/70 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[230px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-700">
                      <Building2 size={18} />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">By Company</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-wrap gap-2">
                  {COMPANIES.map((company) => (
                    <Link
                      key={company}
                      href={`/search/${company}`}
                      prefetch={true}
                      className="ui-tag ui-tag-company border-blue-300/70 bg-blue-50/85 font-semibold text-blue-700 transition hover:-translate-y-[1px] hover:shadow-sm dark:border-cyan-500/45 dark:bg-cyan-950/35 dark:text-cyan-200"
                    >
                      {company}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* -- Batch Year filter -- */}
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-3.5 shadow-lg shadow-slate-200/80 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-slate-950/70 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[230px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
                      <GraduationCap size={18} />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">By Batch Year</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-wrap gap-2">
                  {batchYears.map((year) => (
                    <Link
                      key={year}
                      href={`/search/${year}`}
                      prefetch={true}
                      className="ui-tag ui-tag-batch border-emerald-300/65 bg-emerald-50/85 font-semibold text-emerald-700 transition hover:-translate-y-[1px] hover:shadow-sm dark:border-emerald-500/40 dark:bg-emerald-950/35 dark:text-emerald-300"
                    >
                      {year}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* -- Department filter -- */}
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-3.5 shadow-lg shadow-slate-200/80 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-slate-950/70 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[230px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      <Blocks size={18} />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">By Department</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-wrap gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <Link
                      key={dept.key}
                      href={`/search/${dept.key}`}
                      prefetch={true}
                      className="ui-tag ui-tag-role border-violet-300/65 bg-violet-50/80 font-semibold text-violet-700 transition hover:-translate-y-[1px] hover:shadow-sm dark:border-violet-500/45 dark:bg-violet-950/35 dark:text-violet-300"
                    >
                      {dept.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="topstories" className="px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-300/85 bg-white/90 px-4 py-9 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/85 dark:shadow-[0_16px_38px_rgba(2,6,23,0.62)] sm:px-8 sm:py-11">
          <SectionHeader
            icon={Flame}
            eyebrow="Trending"
            title="Top Interview Stories"
            description="The most-read experiences from the community, ranked by what helped candidates most."
            align="left"
          />

          <div className="mt-10">
            <ScrollableSection>
              {fetchedTopStories.map((story, index) => (
                <Link key={`${story?.uid || 'top'}-${index}`} href={`/single/${story.uid}`} prefetch={true} className="block h-full">
                  <StoryCard story={story} />
                </Link>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>

      {/* 
      <section className="px-4 pb-12 pt-8 sm:pb-14 sm:pt-10">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white/90 px-4 py-9 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 sm:px-8 sm:py-11">
          <SectionHeader
            icon={MessageSquareText}
            eyebrow="Community Voice"
            title="What Students Are Saying"
            description="Feedback from candidates who used theInterview to prepare and build confidence."
          />

          <div className="mt-10">
            <ScrollableSection>
              {BLOG_POSTS.map((post, index) => (
                <article
                  key={`${post.author}-${index}`}
                  className="min-w-[300px] max-w-[360px] rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-lg shadow-slate-200/80 transition hover:-translate-y-1 hover:border-cyan-300/30 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-slate-950/60 dark:hover:border-cyan-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${post.avatarBg} flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white`}
                        aria-hidden="true"
                      >
                        {post.avatar}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold leading-tight text-slate-900 dark:text-slate-100">{post.author}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Student</p>
                      </div>
                    </div>
                    <Quote size={24} className="fill-slate-700 text-slate-700 dark:fill-slate-300 dark:text-slate-300" />
                  </div>

                  <p className="mt-4 line-clamp-4 text-left text-sm italic leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                    {post.content}
                  </p>
                </article>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>
      <section className="px-4 pb-20 pt-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">Help the Community</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-lg mx-auto">Don't see a company listed in the directory? Add it to help others find relevant interview histories.</p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/add-company"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-[1px] hover:from-black hover:to-slate-900 focus:outline-none ring-offset-2 ring-slate-900 focus:ring-2"
            >
              <Plus size={18} /> Add a Company
            </Link>
          </div>
        </div>
      </section>
      */}

    </main>
  )
}
