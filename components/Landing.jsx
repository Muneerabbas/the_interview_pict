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
  Moon,
  Quote,
  Search,
  Sparkles,
  Sun,
  X,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from "next-themes"

const NAV_ITEMS = [
  { href: '/', label: 'Home', sectionId: 'hero' },
  { href: '/companies', label: 'Companies', sectionId: 'companies' },
  { href: '/feed', label: 'Feed', sectionId: 'feed' },
  { href: '#featured', label: 'Featured Stories', sectionId: 'featured' },
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
        className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-white/95 text-slate-600 shadow-lg shadow-slate-200/80 transition hover:border-cyan-300/40 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300 dark:shadow-slate-900/60 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300 sm:inline-flex"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto scroll-smooth px-1 py-1 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-white/95 text-slate-600 shadow-lg shadow-slate-200/80 transition hover:border-cyan-300/40 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300 dark:shadow-slate-900/60 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300 sm:inline-flex"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

const SectionHeader = ({ title, description, ctaHref, ctaLabel }) => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">{description}</p>
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

  return (
    <article className="min-w-[300px] max-w-[360px] rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-lg shadow-slate-200/80 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300/30 hover:shadow-blue-200/80 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-slate-950/60 dark:hover:border-blue-500/40 dark:hover:shadow-blue-950/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`${avatarColor} flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white`}
            aria-hidden="true"
          >
            {story?.name?.charAt(0)?.toUpperCase() || story?.company?.charAt(0)?.toUpperCase() || 'T'}
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">{story?.company || 'Top Company'}</p>
            <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{story?.role || 'Interview Experience'}</p>
          </div>
        </div>
        <Quote size={22} className="shrink-0 fill-slate-300 text-slate-300 opacity-20 dark:fill-slate-600 dark:text-slate-600" />
      </div>

      <div className="relative mt-4 space-y-2 text-left text-sm italic leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
        {bullets.length > 0 ? (
          bullets.map((bullet, index) => (
            <p key={index} className="line-clamp-2">
              {bullet}
            </p>
          ))
        ) : (
          <p className="line-clamp-3">{plainText || 'Practical preparation tips from real rounds and real candidates.'}</p>
        )}
        {/* Gradient fade-out on text */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/80 to-transparent dark:from-slate-900/80" />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
          {story?.views ?? 0}
        </span>
        <span className="group inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 transition-all hover:gap-1.5 dark:text-blue-400">
          Read story
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  )
}

export default function Home({ featuredStories, topStories }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [mountedTheme, setMountedTheme] = useState(false)
  useEffect(() => setMountedTheme(true), [])
  const isDarkMode = mountedTheme && resolvedTheme === 'dark'

  const [fetchedFeaturedStories, setFetchedFeaturedStories] = useState(featuredStories || [])
  const [fetchedTopStories, setFetchedTopStories] = useState(topStories || [])
  const [activeSection, setActiveSection] = useState('Home')

  const mobileMenuRef = useRef(null)
  const mobileMenuButtonRef = useRef(null)

  const batchYears = useMemo(() => Array.from({ length: 2027 - 2019 }, (_, i) => 2027 - i), [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    if (mountedTheme) {
      document.body.classList.toggle('landing-light', resolvedTheme !== 'dark')
    }
  }, [resolvedTheme, mountedTheme])

  useEffect(() => {
    if (Array.isArray(featuredStories)) {
      const shuffled = [...featuredStories].sort(() => Math.random() - 0.5);
      setFetchedFeaturedStories(shuffled);
    } else {
      setFetchedFeaturedStories([]);
    }
  }, [featuredStories])

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_14%_14%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.18),transparent_36%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_14%_14%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(99,102,241,0.2),transparent_36%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] dark:text-slate-100">
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
              <button
                onClick={toggleTheme}
                type="button"
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/85 text-slate-700 shadow-sm transition hover:-translate-y-[0.5px] hover:border-cyan-300/50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-300 dark:hover:border-cyan-500/40 dark:hover:text-slate-100"
              >
                {isDarkMode ? <Sun size={17} className="text-amber-500" /> : <Moon size={17} className="text-slate-600" />}
              </button>
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
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-200/80 transition hover:-translate-y-[0.5px] hover:from-cyan-300 hover:to-sky-300 dark:shadow-cyan-950/40"
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
                <button
                  onClick={toggleTheme}
                  type="button"
                  aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/80 bg-white/90 text-slate-700 shadow-sm transition hover:border-cyan-300/50 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                >
                  {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-slate-600" />}
                </button>
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
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-200/70 transition hover:from-cyan-300 hover:to-sky-300 dark:shadow-cyan-950/40"
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

      <section id="hero" className="relative overflow-hidden px-4 pt-28 pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,#EFF3FF_0%,#F4F6FB_55%,transparent_80%),linear-gradient(to_right,rgba(148,163,184,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.3)_1px,transparent_1px)] bg-[size:auto,46px_46px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_80%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)] dark:bg-[size:46px_46px]" />
        <div className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/25" />
        <div className="pointer-events-none absolute -right-12 top-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl dark:bg-cyan-500/25" />

        <div className="relative mx-auto max-w-6xl text-center">

          <h2
            className={cn(
              "group relative mx-auto mt-4 max-w-2xl text-center text-4xl leading-20 font-bold tracking-tight text-balance text-slate-700 sm:text-5xl md:text-6xl xl:text-7xl dark:text-slate-100",
            )}
          >
            The{" "}
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
            {" "}Room
          </h2>
          <TypingSentence />

          <div className="mt-8 flex flex-row items-center justify-center gap-3">
            {/* PRIMARY: Read Stories — filled accent blue */}
            <Link
              href="/feed"
              prefetch={true}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-[13.5px] font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-95 sm:flex-none sm:text-sm"
            >
              <span className="truncate whitespace-nowrap">Read Stories</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            {/* SECONDARY: Share Your Story — outlined */}
            <Link
              href="/post"
              prefetch={true}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 bg-white/85 px-7 py-3 text-[13.5px] font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 dark:hover:border-blue-500/60 dark:hover:text-blue-300 active:scale-95 sm:flex-none sm:text-sm"
            >
              <span className="truncate whitespace-nowrap">Share Your Story</span>
            </Link>
          </div>

        </div>
      </section>

      <section id="featured" className="relative px-4 pt-4 pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white/90 px-4 py-9 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 sm:px-8 sm:py-11">
          <SectionHeader
            icon={Sparkles}
            eyebrow="Featured"
            title="Featured Stories"
            description="Handpicked interview journeys from students who recently cracked top opportunities."
            ctaHref="/feed"
            ctaLabel="View all stories"
          />

          <div className="mt-10">
            <ScrollableSection>
              {fetchedFeaturedStories.map((story, index) => (
                <Link key={`${story?.uid || 'featured'}-${index}`} href={`/single/${story.uid}`} prefetch={true} className="block h-full">
                  <StoryCard story={story} />
                </Link>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>

      <section id="companyspecific" className="relative px-4 py-10 sm:py-12">
        <div className="pointer-events-none absolute right-0 top-14 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/15" />
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white/80 px-4 py-9 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 sm:px-8 sm:py-11">
          <SectionHeader
            icon={Search}
            eyebrow="Search Smarter"
            title="Find Experiences That Match Your Goal"
            description="Filter by company, batch, or branch and jump straight to relevant interview patterns."
          />

          <div className="mt-10 space-y-5">
            {/* -- Company filter -- */}
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-lg shadow-slate-200/80 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-slate-950/60 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[230px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-700">
                      <Building2 size={18} />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">By Company</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Filter by company, batch, or branch...</p>
                </div>

                <div className="flex flex-1 flex-wrap gap-2">
                  {COMPANIES.map((company) => (
                    <Link
                      key={company}
                      href={`/search/${company}`}
                      prefetch={true}
                      className="ui-tag ui-tag-company transition hover:-translate-y-[1px] hover:shadow-sm"
                    >
                      {company}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* -- Batch Year filter -- */}
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-lg shadow-slate-200/80 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-slate-950/60 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[230px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
                      <GraduationCap size={18} />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">By Batch Year</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Understand how trends changed year by year.</p>
                </div>

                <div className="flex flex-1 flex-wrap gap-2">
                  {batchYears.map((year) => (
                    <Link
                      key={year}
                      href={`/search/${year}`}
                      prefetch={true}
                      className="ui-tag ui-tag-batch transition hover:-translate-y-[1px] hover:shadow-sm"
                    >
                      {year}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* -- Department filter -- */}
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-lg shadow-slate-200/80 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-slate-950/60 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[230px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      <Blocks size={18} />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">By Department</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Focus on realistic prep paths for your branch.</p>
                </div>

                <div className="flex flex-1 flex-wrap gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <Link
                      key={dept.key}
                      href={`/search/${dept.key}`}
                      prefetch={true}
                      className="ui-tag ui-tag-role transition hover:-translate-y-[1px] hover:shadow-sm"
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

      <section id="topstories" className="px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white/90 px-4 py-9 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 sm:px-8 sm:py-11">
          <SectionHeader
            icon={Flame}
            eyebrow="Trending"
            title="Top Interview Stories"
            description="The most-read experiences from the community, ranked by what helped candidates most."
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
