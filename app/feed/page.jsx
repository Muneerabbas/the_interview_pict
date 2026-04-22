"use client";

import Navbar from "../../components/Navbar";
import FeedCard from "../../components/FeedCard";
import FeedHero from "../../components/FeedHero";
import SearchableDropdown from "../../components/SearchableDropdown";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { ArrowUpRight, Loader2, Send, Zap, Clock, SlidersHorizontal, GraduationCap, CalendarDays, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import ProfileCardSkeleton from "../../components/ProfileCardSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

const FEED_CACHE_PREFIX = "feed_state_v2";
const BRANCH_OPTIONS = [
  { label: "Computer Science", value: "CS" },
  { label: "Information Technology", value: "IT" },
  { label: "E&TC", value: "EnTC" },
  { label: "AI & Data Science", value: "AIDS" },
  { label: "Electronics & Comp", value: "EC" },
];
const COLLEGE_PAGE_SIZE = 20;
const YEAR_OPTIONS = Array.from({ length: 28 }, (_, index) => String(2000 + index)).reverse();
const getFeedCacheKey = (tab, filters) =>
  `${FEED_CACHE_PREFIX}:${tab}:${filters.college || "all"}:${filters.branch || "all"}:${filters.batch || "all"}`;

const LoadingScreen = ({ isDarkMode }) => (
  <div
    className={`fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center backdrop-blur-sm ${isDarkMode ? "bg-slate-950/80" : "bg-white/80"
      }`}
  >
    <Loader2 className={`h-10 w-10 animate-spin ${isDarkMode ? "text-cyan-300" : "text-blue-600"}`} />
  </div>
);

export default function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [collegePage, setCollegePage] = useState(1);
  const [collegeHasMore, setCollegeHasMore] = useState(false);
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState("latest"); // 'latest' or 'trending'
  const [pageLoading, setPageLoading] = useState(false);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const [isShareButtonLoading, setIsShareButtonLoading] = useState(false);
  const [tabReady, setTabReady] = useState(false);
  const [filters, setFilters] = useState({
    college: "",
    branch: "",
    batch: "",
  });

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDarkMode = mounted && resolvedTheme === "dark";

  const loadCollegeOptions = async (query, pageToLoad) => {
    setCollegeLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: String(pageToLoad),
        limit: String(COLLEGE_PAGE_SIZE),
      });
      const res = await fetch(`/api/colleges?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCollegeOptions((prev) => (
          pageToLoad === 1
            ? data.data
            : Array.from(new Set([...prev, ...data.data]))
        ));
        setCollegePage(pageToLoad);
        setCollegeHasMore(Boolean(data.pagination?.hasMore));
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setCollegeLoading(false);
    }
  };

  useEffect(() => {
    loadCollegeOptions(collegeSearchTerm, 1);
  }, [collegeSearchTerm]);

  const isFetchingRef = useRef(false);
  const skipNextFetchRef = useRef(false);
  const observer = useRef();
  const lastProfileElementRef = useCallback(
    (node) => {
      if (pageLoading || !hasMoreProfiles) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          // Only increment page if we are actually at the bottom and not currently fetching
          if (entries[0].isIntersecting && hasMoreProfiles && !isFetchingRef.current && profiles.length > 0) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { rootMargin: "400px" }
      );

      if (node) observer.current.observe(node);
    },
    [pageLoading, hasMoreProfiles, profiles.length]
  );

  const fetchProfiles = useCallback(async (pageNumber, limit, sort, activeFilters, forceRefresh = false) => {
    // Avoid redundant fetches if already loading or no more profiles
    if (isFetchingRef.current && pageNumber > 0) return;

    setPageLoading(true);
    isFetchingRef.current = true;
    try {
      const params = new URLSearchParams({
        page: String(pageNumber),
        itemsPerPage: String(limit),
        sort,
      });
      if (activeFilters.college) params.set("college", activeFilters.college);
      if (activeFilters.branch) params.set("branch", activeFilters.branch);
      if (activeFilters.batch) params.set("batch", activeFilters.batch);
      if (forceRefresh) params.set("refresh", "true");

      const url = `/api/feed?${params.toString()}`;
      const response = await axios.get(url);

      // Safety check: only update state if this request matches the current active tab
      if (sort !== activeTab) return;

      const incoming = Array.isArray(response.data) ? response.data : [];

      if (incoming.length > 0) {
        setProfiles((prev) => {
          // If it's page 0, we replace the previous state to avoid stale data
          if (pageNumber === 0) return incoming;

          // Deduplicate based on _id
          const combined = [...prev, ...incoming];
          const uniqueProfiles = [...new Map(combined.map((item) => [item._id, item])).values()];
          return uniqueProfiles;
        });

        if (incoming.length < limit) {
          setHasMoreProfiles(false);
        } else {
          setHasMoreProfiles(true);
        }
      } else {
        setHasMoreProfiles(false);
        if (pageNumber === 0) {
          setProfiles([]);
        }
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      if (pageNumber === 0) {
        setHasMoreProfiles(false);
      }
    } finally {
      setPageLoading(false);
      isFetchingRef.current = false;
    }
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let restored = false;
    try {
      const cached = sessionStorage.getItem(getFeedCacheKey(activeTab, filters));
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheAge = Date.now() - (parsed.timestamp || 0);

        // Only use cache if it was saved within the last 60 seconds
        if (cacheAge < 60 * 1000) {
          const cachedProfiles = Array.isArray(parsed?.profiles) ? parsed.profiles : [];
          const cachedPage = Number.isFinite(Number(parsed?.page)) ? Number(parsed.page) : 0;

          setProfiles(cachedProfiles);
          setPage(cachedPage);
          setHasMoreProfiles(parsed?.hasMoreProfiles ?? true);
          skipNextFetchRef.current = cachedProfiles.length > 0;
          restored = true;

          if (Number.isFinite(parsed?.scrollY)) {
            requestAnimationFrame(() => {
              window.scrollTo({ top: parsed.scrollY, behavior: "auto" });
            });
          }
        } else {
          // Cache expired, remove it and start fresh
          sessionStorage.removeItem(getFeedCacheKey(activeTab, filters));
        }
      }
    } catch (error) {
      console.warn("Failed to restore feed cache:", error);
    }

    if (!restored) {
      setProfiles([]);
      setPage(0);
      setHasMoreProfiles(true);
      skipNextFetchRef.current = false;
    }

    setTabReady(true);
  }, [activeTab, filters]);

  useEffect(() => {
    if (!tabReady) return;
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    fetchProfiles(page, itemsPerPage, activeTab, filters);
  }, [tabReady, page, activeTab, filters, fetchProfiles, itemsPerPage]);

  useEffect(() => {
    if (!tabReady || typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        getFeedCacheKey(activeTab, filters),
        JSON.stringify({
          profiles,
          page,
          hasMoreProfiles,
          scrollY: window.scrollY,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn("Failed to persist feed cache:", error);
    }
  }, [profiles, page, hasMoreProfiles, activeTab, filters, tabReady]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saveScroll = () => {
      try {
        const cached = sessionStorage.getItem(getFeedCacheKey(activeTab, filters));
        if (!cached) return;
        const parsed = JSON.parse(cached);
        sessionStorage.setItem(
          getFeedCacheKey(activeTab, filters),
          JSON.stringify({
            ...parsed,
            scrollY: window.scrollY,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.warn("Failed to update feed scroll cache:", error);
      }
    };

    window.addEventListener("pagehide", saveScroll);
    return () => {
      saveScroll();
      window.removeEventListener("pagehide", saveScroll);
    };
  }, [activeTab, filters]);

  const skeletonCards = Array.from({ length: 3 });

  const handleShareExperienceClick = () => {
    setIsShareButtonLoading(true);
  };

  const activeFilterCount = [filters.college, filters.branch, filters.batch].filter(Boolean).length;

  const handleFilterChange = (key, value) => {
    setProfiles([]);
    setPage(0);
    setHasMoreProfiles(true);
    skipNextFetchRef.current = false;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setProfiles([]);
    setPage(0);
    setHasMoreProfiles(true);
    skipNextFetchRef.current = false;
    setFilters({
      college: "",
      branch: "",
      batch: "",
    });
    // Manually trigger a fresh fetch bypassing API cache
    fetchProfiles(0, itemsPerPage, activeTab, { college: "", branch: "", batch: "" }, true);
  };

  return (
    <main className="relative min-h-screen overflow-x-clip font-sans bg-transparent">
      {/* Fixed Premium Background Layer */}
      <div className="fixed inset-0 -z-30 bg-[#f8fbff] dark:bg-[#020617]">
        {/* Base Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(45,212,191,0.14),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1120_55%,#111827_100%)]" />
      </div>

      {/* Glow Layer */}
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <div className="absolute left-[-140px] top-24 h-[400px] w-[400px] rounded-full bg-sky-300/20 blur-[120px] dark:bg-sky-500/15" />
        <div className="absolute right-[-120px] top-[320px] h-[400px] w-[400px] rounded-full bg-indigo-300/20 blur-[120px] dark:bg-indigo-500/15" />
      </div>

      {/* Grid layer - matching Companies tab style */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]"
        style={{
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />

      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.38),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.08),transparent_42%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.07),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(2,6,23,0.65),transparent_45%)]" />

      {/* Center Reading Track */}
      <div className="fixed inset-y-0 left-1/2 w-full max-w-[800px] -translate-x-1/2 -z-10 bg-slate-100/10 dark:bg-slate-900/20 pointer-events-none" />

      <Navbar showThemeToggle />
      {isShareButtonLoading && <LoadingScreen isDarkMode={isDarkMode} />}

      <div className="relative mx-auto max-w-[800px] px-4 pb-14 pt-16 sm:px-6 md:pt-24">
        {/* Hero Section */}
        <FeedHero isDarkMode={isDarkMode} />


        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-[0_14px_40px_rgba(2,6,23,0.6)] sm:p-6">
          {/* Header & Tabs */}
          <div className="mb-6 border-b border-slate-200 pb-2 dark:border-slate-700">
            {/* Tab Switcher */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/85 p-1.5 shadow-inner dark:border-slate-800 dark:bg-slate-900/40">
                <button
                  onClick={() => setActiveTab("latest")}
                  className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${activeTab === "latest"
                    ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200/50 dark:bg-slate-800 dark:text-blue-300 dark:ring-slate-700"
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    }`}
                >
                  <Clock size={16} />
                  Latest
                </button>
                <button
                  onClick={() => setActiveTab("trending")}
                  className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${activeTab === "trending"
                    ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200/50 dark:bg-slate-800 dark:text-blue-300 dark:ring-slate-700"
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    }`}
                >
                  <Zap size={16} />
                  Trending
                </button>
              </div>

              <Link
                href="/post"
                onClick={handleShareExperienceClick}
                prefetch={true}
                scroll={false}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-[1.5px] hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95 dark:shadow-blue-500/20 sm:text-sm"
              >
                <Send className="h-4 w-4" />
                Post Your Story
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative z-20 mb-6 rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(248,250,252,0.82)_100%)] shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.84)_0%,rgba(2,6,23,0.8)_100%)] dark:shadow-[0_16px_40px_rgba(2,6,23,0.45)]">
            <div className="flex flex-col gap-3 border-b border-slate-200/70 px-4 py-4 dark:border-slate-700/80 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-cyan-950/40 dark:text-cyan-300">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Refine The Feed</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${activeFilterCount > 0 ? "bg-blue-600 text-white dark:bg-cyan-400 dark:text-slate-950" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                  <span>{activeFilterCount}</span>
                  <span>{activeFilterCount === 1 ? "filter active" : "filters active"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchProfiles(0, itemsPerPage, activeTab, filters, true)}
                  disabled={pageLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  title="Force refresh (bypass cache)"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${pageLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-[1.4fr_1fr_1fr]">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  College
                </span>
                <div className="relative z-[30]">
                  <SearchableDropdown
                    options={[{ label: "All colleges", value: "" }, ...collegeOptions.map((college) => ({ label: college, value: college }))]}
                    value={filters.college}
                    onChange={(value) => handleFilterChange("college", value)}
                    placeholder="All colleges"
                    remoteSearch
                    loading={collegeLoading}
                    hasMore={collegeHasMore}
                    onSearchTermChange={setCollegeSearchTerm}
                    onLoadMore={() => {
                      if (!collegeLoading && collegeHasMore) {
                        loadCollegeOptions(collegeSearchTerm, collegePage + 1);
                      }
                    }}
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Department
                </span>
                <div className="relative z-[20]">
                  <SearchableDropdown
                    options={[{ label: "All departments", value: "" }, ...BRANCH_OPTIONS]}
                    value={filters.branch}
                    onChange={(value) => handleFilterChange("branch", value)}
                    placeholder="All departments"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Year
                </span>
                <div className="relative z-[10]">
                  <SearchableDropdown
                    options={[{ label: "All years", value: "" }, ...YEAR_OPTIONS.map((year) => ({ label: year, value: year }))]}
                    value={filters.batch}
                    onChange={(value) => handleFilterChange("batch", value)}
                    placeholder="All years"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            {pageLoading && page === 0 && profiles.length === 0 ? (
              skeletonCards.map((_, index) => <ProfileCardSkeleton key={index} />)
            ) : (
              <AnimatePresence mode="popLayout">
                {profiles.map((profile, index) => (
                  <motion.div
                    key={profile._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: (index % 10) * 0.03 }}
                  >
                    <FeedCard profile={profile} width="w-full" />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Sentinel for Intersection Observer */}
            <div ref={lastProfileElementRef} className="h-4 w-full" />

            {profiles.length === 0 && !pageLoading && (
              <div className="py-20 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 dark:bg-slate-800/50 dark:text-slate-600">
                  <Clock size={32} />
                </div>
                <p className="text-base font-medium text-slate-500 dark:text-slate-400">
                  No stories found for this category yet.
                </p>
                <button
                  onClick={() => {
                    setActiveTab("latest");
                    clearFilters();
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-col items-center space-y-4 pb-2">
            {pageLoading && (
              <div className="flex items-center space-x-3 rounded-full border border-indigo-100 bg-white px-6 py-3 text-indigo-600 shadow-sm dark:border-cyan-500/30 dark:bg-slate-900 dark:text-cyan-300">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-semibold">Loading more experiences...</span>
              </div>
            )}

            {!pageLoading && !hasMoreProfiles && profiles.length > 0 && (
              <div className="flex w-full items-center justify-center py-6">
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="px-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">You have reached the end</span>
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
