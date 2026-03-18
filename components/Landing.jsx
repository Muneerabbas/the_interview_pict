// LandingPage.jsx
'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import logo from "../public/icon.svg"
import Image from 'next/image'
import { Menu, X, ChevronLeft, ChevronRight, Search, Building2, GraduationCap, Blocks, Quote } from "lucide-react"
import AdComponent from "@/components/AdComponent";


// Reusable ScrollableSection component
const ScrollableSection = ({ children }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    const scrollAmount = container.offsetWidth;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow sm:inline-flex"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth px-1 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow sm:inline-flex"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>

  );
};

// StoryCard component
const StoryCard = ({ story, avatarColor }) => {
  // Remove markdown formatting characters
  let plainText = story?.exp_text || '';

  // Remove bold and italic markers
  plainText = plainText.replace(/\*\*|_/g, '');
  plainText = plainText.replace(/__/g, '');
  plainText = plainText.replace(/\*/g, '');
  plainText = plainText.replace(/_/g, '');

  // Remove headings (lines starting with #, ##, ### etc.)
  plainText = plainText.replace(/^#+\s/gm, ''); // Remove headings like # Heading, ## Subheading

  // Remove lists (unordered and ordered)
  plainText = plainText.replace(/^[\s]*[*+-]\s/gm, ''); // Remove unordered list markers like * item, - item, + item
  plainText = plainText.replace(/^[\s]*\d+\.\s/gm, ''); // Remove ordered list markers like 1. item, 2. item

  // Remove blockquotes (lines starting with >)
  plainText = plainText.replace(/^>\s/gm, ''); // Remove blockquote markers like > quote

  // Remove inline code (``...``)
  plainText = plainText.replace(/`([^`]+)`/g, '$1'); // Replace `code` with code

  // Remove horizontal rules (lines consisting of ---, ***, or ___)
  plainText = plainText.replace(/^[-*_]{3,}$/gm, '');

    // remove extra spaces and lines
    plainText = plainText.replace(/[\r\n]+/g, ' ').trim(); // Replace line breaks with spaces and trim

  const bullets = plainText
    .split(/\. +/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <div className="min-w-[300px] max-w-[360px] h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`${avatarColor} flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white`}
              aria-hidden="true"
            >
              {story?.company?.charAt(0)?.toUpperCase() || "T"}
            </div>
            <div className="min-w-0 text-left">
              <div className="font-semibold text-slate-900 truncate leading-tight">{story?.company}</div>
              <div className="text-xs font-medium text-slate-500 truncate">
                {story?.role || "Interview Experience"}
              </div>
            </div>
          </div>
          <div className="flex text-slate-200">
            <Quote size={28} className="fill-slate-200" />
          </div>
        </div>

        <div className="mt-4 space-y-2 text-left text-sm sm:text-base text-slate-700 italic leading-relaxed">
          {bullets.length > 0 ? (
            bullets.map((b, i) => (
              <div key={i} className="line-clamp-2">
                {b}
              </div>
            ))
          ) : (
            <div className="line-clamp-3">{plainText}</div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-500">
          {story?.views ?? 0} views
        </span>
        <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Read story <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
};


export default function Home({ featuredStories, topStories }) { // Accept fetched stories as props
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null); // ADD: Ref for mobile menu button
  const [isVisible, setIsVisible] = useState(false);
  const [storyCardColors, setStoryCardColors] = useState({});
  const [fetchedFeaturedStories, setFetchedFeaturedStories] = useState(featuredStories || []); // Use props, fallback to empty array
  const [fetchedTopStories, setFetchedTopStories] = useState(topStories || []); // Use props, fallback to empty array
  const [activeSection, setActiveSection] = useState('Home'); // ADD: State to track active section

  useEffect(() => {
    const fetchTopStories = async () => {
      try {
        const response = await fetch('https://www.pict.live/api/topStories');
        const data = await response.json();
        setFetchedTopStories(data);
        console.log("top stories", data);
      } catch (error) {
        console.error("Fetching top stories failed:", error);
      }
    };
    const fetchFeaturedStories = async () => {
      try {
        const response = await fetch('https://www.pict.live/api/feed');
        const data = await response.json();
        setFetchedFeaturedStories(data);
        console.log("featured stories", data);
      } catch (error) {
        console.error("Fetching top stories failed:", error);
      }
    };
    fetchFeaturedStories();
    fetchTopStories();
  }, []);
 



  const navItems = [
    { href: '/', label: 'Home', sectionId: 'hero' }, // ADD: sectionId, Changed href to "/" for landing page home
    { href: '/about', label: 'About Us', sectionId: 'about' }, // ADDED: About Us nav item
    { href: '/feed', label: 'Feed', sectionId: 'feed' }, // ADDED: Feed nav item
    { href: '#featured', label: 'Featured Stories', sectionId: 'featured' }, // ADD: sectionId
    { href: '#topstories', label: 'Top Stories', sectionId: 'topstories' }, // ADD: sectionId
    { href: '#companyspecific', label: 'Search Experience', sectionId: 'companyspecific' }, // ADD: sectionId
    { href: '/post', label: 'Share Experience', sectionId: 'share' } // ADD: sectionId
  ];

  const blogPosts = [

    {
      author: 'Siddhant Vishnu',
      content: `"Unbelivable stuff from seniors❤️ !Can't ask for more"`,
      avatarBg: "bg-green-600",
      avatar: 'S'
    },
    {
      author: 'Shlok S',
      content: `"Bro abhi job lag jaegi"`,
      avatarBg: "bg-red-400",
      avatar: 'S'
    },
    {
      author: 'Shreya Hiwarkar',
      content: `"Great work ! Really helpful"`,
      avatarBg: "bg-orange-400",
      avatar: 'S'
    },

  ];

  const batchYears = Array.from({ length: 2027 - 2019 }, (_, i) => 2027 - i);
  const departments = [
    { key: "CS", label: "Computer Science" },
    { key: "IT", label: "Information Tech" },
    { key: "EnTC", label: "EnTC" },
    { key: "AIDS", label: "AI & Data Science" },
    { key: "EC", label: "Electronics" },
  ];
  const companies = ["Barclays", "Mastercard", "BNY", "Siemens", "Arista", "Tracelink", "PhonePe"];

  const companyColors = {
    'Barclays': { bg: 'bg-blue-700', text: 'text-blue-700' },
    'Mastercard': { bg: 'bg-red-600', text: 'text-red-600' },
    'BNY': { bg: 'bg-purple-600', text: 'text-purple-600' },
    'Siemens': { bg: 'bg-teal-600', text: 'text-teal-600' },
    'Arista': { bg: 'bg-blue-500', text: 'text-blue-500' },
    'Tracelink': { bg: 'bg-indigo-600', text: 'text-indigo-600' },
    'PhonePe': { bg: 'bg-purple-700', text: 'text-purple-700' },
 };

  const batchColors = {
    2027: 'text-green-500',
    2026: 'text-blue-500',
    2025: 'text-yellow-500',
    2024: 'text-red-500',
    2023: 'text-purple-500',
    2022: 'text-teal-500',
    2021: 'text-orange-500',
    2020: 'text-pink-500',
    2019: 'text-gray-500',
  };

  const branchColors = {
    "CS": 'text-indigo-500',
    "IT": 'text-emerald-500',
    "EnTC": 'text-rose-500',
    "AIDS": 'text-cyan-500',
    "EC": 'text-amber-500'
  }


  const getRandomColor = () => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !(mobileMenuButtonRef.current && mobileMenuButtonRef.current.contains(event.target))) { // MODIFIED: Check if click is NOT inside mobile menu button ref
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const colors = {};
    fetchedFeaturedStories.forEach((story, index) => {
      colors[story.uid] = getRandomColor();
    });
    fetchedTopStories.forEach((story, index) => {
      colors[story.uid] = getRandomColor();
    });
    setStoryCardColors(colors);
  }, [fetchedFeaturedStories, fetchedTopStories]);

  useEffect(() => { // ADD: useEffect to handle active section based on scroll
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.sectionId)).filter(Boolean);
      let currentSection = 'Home'; // Default to Home

      for (const section of sections) {
        if (!section) continue; // Skip if section element is not found

        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) { // Adjust offset as needed
          currentSection = navItems.find(item => item.sectionId === section.id)?.label || currentSection;
          break; // Exit loop once active section is found
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on load

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems, setActiveSection]);


  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-black/5 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex justify-between items-center">
            <Link href="/" prefetch={true} className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
              <Image src={logo} alt="theInterview Logo" width={34} height={34} priority />
              <span className="text-lg">
                the<span className="text-blue-600">Interview</span>
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {navItems
                .filter((i) => i.label !== "Search Experience" && i.label !== "Share Experience")
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={[
                      "rounded-xl px-3 py-2 text-sm font-medium transition",
                      activeSection === item.label
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Search size={18} className="text-slate-500" />
                Search
              </Link>
              <Link
                href="/post"
                prefetch={true}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Share Experience
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <div className="flex justify-between items-center">
              <Link href="/" prefetch={true} className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
                <Image src={logo} alt="theInterview Logo" width={32} height={32} priority />
                <span className="text-base sm:text-lg">
                  the<span className="text-blue-600">Interview</span>
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
                ref={mobileMenuButtonRef} // ADD: Ref to mobile menu button
              >
                {isMobileMenuOpen ? (
                  <X size={20} />
                ) : (
                  <Menu size={20} />
                )}
              </button>
            </div>

            {isMobileMenuOpen && (
              <div
                className="absolute left-0 right-0 top-full bg-white/95 backdrop-blur-md shadow-xl border-b border-black/5"
                ref={mobileMenuRef}
              >
                <div className="p-3">
                  <Link
                    href="/search"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Search size={18} className="text-slate-500" />
                    Search
                  </Link>

                  {navItems
                    .filter((i) => i.label !== "Search Experience" && i.label !== "Share Experience")
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        className={[
                          "block rounded-xl px-3 py-2.5 text-sm font-medium transition",
                          activeSection === item.label
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-800 hover:bg-slate-100",
                        ].join(" ")}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}

                  <Link
                    href="/post"
                    prefetch={true}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
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

      {/* Hero Section */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-b from-[#f7f9ff] via-white to-white text-center pt-24 sm:pt-32 pb-16 px-4"
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className={`transform transition-all duration-700 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
        }`}>
          {/* Ad Placement */}
      {/* <AdComponent slot="4811519147" /> */}

          <div className="mx-auto max-w-3xl">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25">
              <Image src={logo} alt="theInterview Logo" width={34} height={34} className="invert" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]">
              Share Your <span className="text-blue-600">Interview</span>
              <br />
              Journey
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600">
              Learn from real experiences. Share your story. Help others succeed in their next career move.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/feed"
                prefetch={true}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Read Stories
              </Link>
              <Link
                href="/post"
                prefetch={true}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-200"
              >
                Share Your Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section id="featured" className="bg-slate-50 py-14 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <span className="text-xl">✨</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Featured Stories
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
              Insights from top candidates at leading tech companies.
            </p>
            <div className="mt-4 flex justify-center">
              <Link
                href="/feed"
                prefetch={true}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                View all stories <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <ScrollableSection>
              {fetchedFeaturedStories.map((story, index) => (
                <Link
                  key={index}
                  href={`/single/${story.uid}`}
                  prefetch={true}
                  className="block h-full"
                >
                  <StoryCard story={story} avatarColor={storyCardColors[story.uid]} />
                </Link>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>

      {/* Company Specific Tips Section - Renamed to Search by Company for clarity */}
      <section id="companyspecific" className="bg-white py-14 sm:py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <Search size={18} className="text-blue-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Search Experiences
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
              Browse authentic interview insights shared by alumni and peers. Refine your search to find the most relevant career guidance.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {/* Company */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[220px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <Building2 size={18} />
                    </div>
                    <div className="font-semibold text-slate-900">Company</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Browse processes from top-tier organizations.
                  </p>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                  {companies.map((company) => (
                    <Link
                      key={company}
                      href={`/search/${company}`}
                      prefetch={true}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-800 shadow-sm transition hover:bg-white hover:shadow"
                    >
                      {company}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Batch year */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[220px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <GraduationCap size={18} />
                    </div>
                    <div className="font-semibold text-slate-900">Batch Year</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    See the evolution of interviews across graduating classes.
                  </p>
                </div>

                <div className="grid flex-1 grid-cols-4 gap-3 sm:grid-cols-7">
                  {batchYears.map((year) => {
                    return (
                      <Link
                        key={year}
                        href={`/search/${year}`}
                        prefetch={true}
                        className={[
                          "rounded-xl px-4 py-3 text-center text-sm font-semibold shadow-sm transition",
                          "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-white hover:shadow",
                        ].join(" ")}
                      >
                        {year}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:max-w-[220px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                      <Blocks size={18} />
                    </div>
                    <div className="font-semibold text-slate-900">Department</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Narrow down results based on your academic specialization.
                  </p>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                  {departments.map((dept) => (
                    <Link
                      key={dept.key}
                      href={`/search/${dept.key}`}
                      prefetch={true}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-800 shadow-sm transition hover:bg-white hover:shadow"
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

      {/* Top Stories */}
      <section id="topstories" className="bg-slate-50 py-14 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <span className="text-xl">🔥</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Top Interview Stories
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
              The most read and helpful interview experiences from the community.
            </p>
          </div>
          <div className="mt-8">
            <ScrollableSection>
              {fetchedTopStories.map((story, index) => (
                <Link key={index} href={`/single/${story.uid}`} prefetch={true} className="block h-full">
                  <StoryCard story={story} avatarColor={storyCardColors[story.uid]} />
                </Link>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="bg-white py-14 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <span className="text-xl">💬</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              What Community Says
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
              Real feedback from students using theInterview to prepare smarter and land their dream roles.
            </p>
          </div>

          <div className="mt-8">
            <ScrollableSection>
              {blogPosts.map((post, index) => (
                <article
                  key={index}
                  className="min-w-[300px] max-w-[360px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${post.avatarBg} flex h-11 w-11 items-center justify-center rounded-full text-white font-bold`}
                        aria-hidden="true"
                      >
                        {post.avatar}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-slate-900 leading-tight">{post.author}</div>
                        <div className="text-xs font-medium text-slate-500">Student</div>
                      </div>
                    </div>
                    <div className="flex text-slate-200">
                      <Quote size={28} className="fill-slate-200" />
                    </div>
                  </div>

                  <p className="mt-4 text-left text-sm sm:text-base text-slate-700 italic leading-relaxed line-clamp-4">
                    {post.content}
                  </p>
                </article>
              ))}
            </ScrollableSection>
          </div>
        </div>
      </section>
    </main>
  );
}
