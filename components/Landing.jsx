'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import logo from '../public/icon.svg'
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
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Home', sectionId: 'hero' },
  { href: '/about', label: 'About Us', sectionId: 'about' },
  { href: '/feed', label: 'Feed', sectionId: 'feed' },
  { href: '#featured', label: 'Featured Stories', sectionId: 'featured' },
  { href: '#topstories', label: 'Top Stories', sectionId: 'topstories' },
  { href: '#companyspecific', label: 'Search Experience', sectionId: 'companyspecific' },
  { href: '/post', label: 'Share Experience', sectionId: 'share' },
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
        className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-900/95 text-slate-300 shadow-lg shadow-black/40 transition hover:border-cyan-300/40 hover:text-cyan-200 sm:inline-flex"
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
        className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-900/95 text-slate-300 shadow-lg shadow-black/40 transition hover:border-cyan-300/40 hover:text-cyan-200 sm:inline-flex"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

const SectionHeader = ({ icon: Icon, eyebrow, title, description, ctaHref, ctaLabel }) => {
  return (
    <div className="text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
        <Icon size={14} />
        {eyebrow}
      </div>
      <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-100 sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">{description}</p>
      {ctaHref && ctaLabel && (
        <div className="mt-5">
          <Link
            href={ctaHref}
            prefetch={true}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
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
    <article className="min-w-[300px] max-w-[360px] rounded-2xl border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/40 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-cyan-950/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`${avatarColor} flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white`}
            aria-hidden="true"
          >
            {story?.company?.charAt(0)?.toUpperCase() || 'T'}
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold leading-tight text-slate-100">{story?.company || 'Top Company'}</p>
            <p className="truncate text-xs font-medium text-slate-400">{story?.role || 'Interview Experience'}</p>
          </div>
        </div>
        <Quote size={24} className="fill-slate-700 text-slate-700" />
      </div>

      <div className="mt-4 space-y-2 text-left text-sm italic leading-relaxed text-slate-300 sm:text-base">
        {bullets.length > 0 ? (
          bullets.map((bullet, index) => (
            <p key={index} className="line-clamp-2">
              {bullet}
            </p>
          ))
        ) : (
          <p className="line-clamp-3">{plainText || 'Practical preparation tips from real rounds and real candidates.'}</p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-xs font-medium text-slate-400">{story?.views ?? 0} views</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300">
          Read story
          <ChevronRight size={14} />
        </span>
      </div>
    </article>
  )
}

export default function Home({ featuredStories, topStories }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [fetchedFeaturedStories, setFetchedFeaturedStories] = useState(featuredStories || [])
  const [fetchedTopStories, setFetchedTopStories] = useState(topStories || [])
  const [activeSection, setActiveSection] = useState('Home')

  const mobileMenuRef = useRef(null)
  const mobileMenuButtonRef = useRef(null)

  const batchYears = useMemo(() => Array.from({ length: 2027 - 2019 }, (_, i) => 2027 - i), [])

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const [featuredResponse, topResponse] = await Promise.all([
          fetch('https://www.pict.live/api/feed'),
          fetch('https://www.pict.live/api/topStories'),
        ])
        const [featuredData, topData] = await Promise.all([featuredResponse.json(), topResponse.json()])
        setFetchedFeaturedStories(Array.isArray(featuredData) ? featuredData : [])
        setFetchedTopStories(Array.isArray(topData) ? topData : [])
      } catch (error) {
        console.error('Fetching landing stories failed:', error)
      }
    }

    fetchStories()
    setIsVisible(true)

    document.body.classList.add('landing-dark')
    return () => {
      document.body.classList.remove('landing-dark')
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

  const uniqueStoryCount = useMemo(() => {
    const ids = new Set()
    fetchedFeaturedStories.forEach((story) => ids.add(story?.uid || `${story?.company}-${story?.role}`))
    fetchedTopStories.forEach((story) => ids.add(story?.uid || `${story?.company}-${story?.role}`))
    return ids.size
  }, [fetchedFeaturedStories, fetchedTopStories])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_14%_14%,rgba(14,116,144,0.16),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(30,64,175,0.16),transparent_35%),linear-gradient(180deg,#020617_0%,#020617_45%,#0b1120_100%)] text-slate-100">
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/75 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="hidden items-center justify-between lg:flex">
            <Link href="/" prefetch={true} className="flex items-center gap-2 font-semibold tracking-tight text-slate-100">
              <Image src={logo} alt="theInterview Logo" width={34} height={34} priority />
              <span className="text-lg">
                the<span className="text-cyan-300">Interview</span>
              </span>
            </Link>

            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/60 p-1">
              {NAV_ITEMS.filter((item) => item.label !== 'Search Experience' && item.label !== 'Share Experience').map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={[
                    'rounded-full px-3 py-2 text-sm font-medium transition',
                    activeSection === item.label
                      ? 'bg-cyan-400/15 text-cyan-200'
                      : 'text-slate-300 hover:bg-white/10 hover:text-slate-100',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
              >
                <Search size={17} className="text-slate-400" />
                Search
              </Link>
              <Link
                href="/post"
                prefetch={true}
                className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-900/30 transition hover:bg-cyan-300"
              >
                Share Experience
              </Link>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="flex items-center justify-between">
              <Link href="/" prefetch={true} className="flex items-center gap-2 font-semibold tracking-tight text-slate-100">
                <Image src={logo} alt="theInterview Logo" width={32} height={32} priority />
                <span className="text-base sm:text-lg">
                  the<span className="text-cyan-300">Interview</span>
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-slate-900/80 text-slate-200 transition hover:border-cyan-300/30 hover:text-cyan-100"
                ref={mobileMenuButtonRef}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {isMobileMenuOpen && (
              <div
                className="absolute left-0 right-0 top-full border-b border-white/10 bg-slate-950/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
                ref={mobileMenuRef}
              >
                <div className="space-y-1 p-3">
                  <Link
                    href="/search"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Search size={18} className="text-slate-400" />
                    Search
                  </Link>

                  {NAV_ITEMS.filter((item) => item.label !== 'Search Experience' && item.label !== 'Share Experience').map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className={[
                        'block rounded-xl px-3 py-2.5 text-sm font-medium transition',
                        activeSection === item.label ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-200 hover:bg-white/10',
                      ].join(' ')}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <Link
                    href="/post"
                    prefetch={true}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
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

      <section id="hero" className="relative overflow-hidden px-4 pb-20 pt-28 sm:pb-24 sm:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_center,black_34%,transparent_80%)]" />
        <div className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 top-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />

        <div
          className={[
            'relative mx-auto max-w-6xl text-center transition-all duration-700 ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          ].join(' ')}
        >


          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Turn interview stress into
            <span className="block bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-200 bg-clip-text text-transparent">
              clear preparation steps
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
            Real students share what they were asked, what worked, and what they would do differently. Prepare smarter, not
            blindly.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/feed"
              prefetch={true}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-7 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-900/25 transition hover:bg-cyan-300 sm:w-auto"
            >
              Read Stories
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/post"
              prefetch={true}
              className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-slate-900/80 px-7 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/35 hover:text-cyan-100 sm:w-auto"
            >
              Share Your Story
            </Link>
          </div>

          <div className="mx-auto mt-11 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-4 text-left shadow-lg shadow-black/40">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Stories Live</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{uniqueStoryCount || 0}</p>
              <p className="mt-1 text-sm text-slate-300">Community experiences in one place</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-4 text-left shadow-lg shadow-black/40">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Top Picks</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{fetchedTopStories.length}</p>
              <p className="mt-1 text-sm text-slate-300">Most read experiences this week</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-4 text-left shadow-lg shadow-black/40">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Featured</p>
              <p className="mt-2 text-2xl font-black text-slate-100">{fetchedFeaturedStories.length}</p>
              <p className="mt-1 text-sm text-slate-300">Freshly shared interview journeys</p>
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1">
              <ShieldCheck size={13} className="text-emerald-300" />
              Peer verified stories
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1">
              <TrendingUp size={13} className="text-cyan-300" />
              Interview trends by company
            </span>
          </div>
        </div>
      </section>

      <section id="featured" className="relative px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-slate-950/55 px-4 py-9 backdrop-blur-sm sm:px-8 sm:py-11">
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

      <section id="companyspecific" className="relative px-4 py-16 sm:py-20">
        <div className="pointer-events-none absolute right-0 top-14 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-9 backdrop-blur-sm sm:px-8 sm:py-11">
          <SectionHeader
            icon={Search}
            eyebrow="Search Smarter"
            title="Find Experiences That Match Your Goal"
            description="Filter by company, batch, or branch and jump straight to relevant interview patterns."
          />

          <div className="mt-10 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/35 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[230px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200">
                      <Building2 size={18} />
                    </div>
                    <p className="font-semibold text-slate-100">By Company</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Track each company process and see where candidates got selected.</p>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                  {COMPANIES.map((company) => (
                    <Link
                      key={company}
                      href={`/search/${company}`}
                      prefetch={true}
                      className="rounded-xl border border-white/10 bg-slate-950/75 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
                    >
                      {company}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/35 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[230px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
                      <GraduationCap size={18} />
                    </div>
                    <p className="font-semibold text-slate-100">By Batch Year</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Understand how trends changed year by year and prep accordingly.</p>
                </div>

                <div className="grid flex-1 grid-cols-4 gap-3 sm:grid-cols-7">
                  {batchYears.map((year) => (
                    <Link
                      key={year}
                      href={`/search/${year}`}
                      prefetch={true}
                      className="rounded-xl border border-white/10 bg-slate-950/75 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-emerald-300/30 hover:text-white"
                    >
                      {year}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/35 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[230px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-200">
                      <Blocks size={18} />
                    </div>
                    <p className="font-semibold text-slate-100">By Department</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Look at stories from your branch to focus on realistic prep paths.</p>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                  {DEPARTMENTS.map((dept) => (
                    <Link
                      key={dept.key}
                      href={`/search/${dept.key}`}
                      prefetch={true}
                      className="rounded-xl border border-white/10 bg-slate-950/75 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:border-amber-300/30 hover:text-white"
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

      <section id="topstories" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-slate-950/55 px-4 py-9 backdrop-blur-sm sm:px-8 sm:py-11">
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

      <section className="px-4 pb-16 pt-10 sm:pb-20 sm:pt-14">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-slate-950/55 px-4 py-9 backdrop-blur-sm sm:px-8 sm:py-11">
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
                  className="min-w-[300px] max-w-[360px] rounded-2xl border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/40 transition hover:-translate-y-1 hover:border-cyan-300/30"
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
                        <p className="font-semibold leading-tight text-slate-100">{post.author}</p>
                        <p className="text-xs font-medium text-slate-400">Student</p>
                      </div>
                    </div>
                    <Quote size={24} className="fill-slate-700 text-slate-700" />
                  </div>

                  <p className="mt-4 line-clamp-4 text-left text-sm italic leading-relaxed text-slate-300 sm:text-base">
                    {post.content}
                  </p>
                </article>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>
    </main>
  )
}
