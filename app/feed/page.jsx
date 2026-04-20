"use client";

import Navbar from "../../components/Navbar";
import FeedPostCard from "../../components/FeedPostCard";
import FeedHero from "../../components/FeedHero";
import SearchableDropdown from "../../components/SearchableDropdown";
import FeedSearch from "../../components/FeedSearch";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { ArrowUpRight, Loader2, Send, Zap, Clock, SlidersHorizontal, GraduationCap, CalendarDays, Building2, UserRound, X, RefreshCw, ChevronDown } from "lucide-react";
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
  `${FEED_CACHE_PREFIX}:${tab}:${filters.company || "all"}:${filters.author || "all"}:${filters.college || "all"}:${filters.branch || "all"}:${filters.batch || "all"}`;

const LoadingScreen = ({ isDarkMode }) => (
  <div
    className={`fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center backdrop-blur-sm ${isDarkMode ? "bg-slate-950/80" : "bg-white/80"
      }`}
  >
    <Loader2 className={`h-10 w-10 animate-spin ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
  </div>
);

export default function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [authorOptions, setAuthorOptions] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [collegePage, setCollegePage] = useState(1);
  const [collegeHasMore, setCollegeHasMore] = useState(false);
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState("random"); // 'latest', 'trending', or 'random' (Feed)
  const [pageLoading, setPageLoading] = useState(false);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const [isShareButtonLoading, setIsShareButtonLoading] = useState(false);
  const [tabReady, setTabReady] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    company: "",
    author: "",
    college: "",
    branch: "",
    batch: "",
  });

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDarkMode = mounted && resolvedTheme === "dark";

  useEffect(() => {
    const loadCompanyOptions = async () => {
      setCompaniesLoading(true);
      try {
        const res = await fetch("/api/getCompanies");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const names = data.data.map((company) => company.name).filter(Boolean);
          setCompanyOptions(Array.from(new Set(names)).sort((a, b) => a.localeCompare(b)));
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setCompaniesLoading(false);
      }
    };

    loadCompanyOptions();
  }, []);

  useEffect(() => {
    const loadAuthorOptions = async () => {
      setAuthorsLoading(true);
      try {
        const response = await fetch("/api/feed?options=authors");
        const data = await response.json();
        setAuthorOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching authors:", error);
      } finally {
        setAuthorsLoading(false);
      }
    };
    loadAuthorOptions();
  }, []);

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

  const fetchProfiles = useCallback(async (pageNumber, limit, sort, activeFilters, forceRefresh = false, excludedProfileIds = []) => {
    // Avoid redundant fetches if already loading or no more profiles
    if (isFetchingRef.current && pageNumber > 0) return;

    setPageLoading(true);
    isFetchingRef.current = true;
    try {
      const params = new URLSearchParams({
        page: String(pageNumber),
        itemsPerPage: String(limit),
        sort,
        _ts: Date.now().toString(), // Cache busting
      });
      if (activeFilters.company) params.set("company", activeFilters.company);
      if (activeFilters.author) params.set("author", activeFilters.author);
      if (activeFilters.college) params.set("college", activeFilters.college);
      if (activeFilters.branch) params.set("branch", activeFilters.branch);
      if (activeFilters.batch) params.set("batch", activeFilters.batch);
      if (searchQuery) params.set("q", searchQuery);
      if (forceRefresh) params.set("refresh", "true");
      if (sort === "random" && pageNumber > 0 && excludedProfileIds.length > 0) {
        params.set("exclude", excludedProfileIds.join(","));
      }

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
  }, [activeTab, searchQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip persistence for random discovery tab to ensure variety
    if (activeTab === "random") {
      setProfiles([]);
      setPage(0);
      setHasMoreProfiles(true);
      skipNextFetchRef.current = false;
      setTabReady(true);
      return;
    }

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
    fetchProfiles(
      page,
      itemsPerPage,
      activeTab,
      filters,
      false,
      activeTab === "random" ? profiles.map((profile) => profile._id) : []
    );
  }, [tabReady, page, activeTab, filters, fetchProfiles, itemsPerPage]);

  useEffect(() => {
    if (!tabReady || typeof window === "undefined" || activeTab === "random") return;
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

  const activeFilterCount = [filters.company, filters.author, filters.college, filters.branch, filters.batch].filter(Boolean).length;

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
      company: "",
      author: "",
      college: "",
      branch: "",
      batch: "",
    });
    // Manually trigger a fresh fetch bypassing API cache
    fetchProfiles(0, itemsPerPage, activeTab, { company: "", author: "", college: "", branch: "", batch: "" }, true);
  };

  const handleSearchChange = useCallback((value) => {
    setProfiles([]);
    setPage(0);
    setHasMoreProfiles(true);
    skipNextFetchRef.current = false;
    setSearchQuery(value);
  }, []);

  const renderFilterFields = () => (
    <div className="space-y-4">
      <label className="block space-y-2">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          <Building2 className="h-3.5 w-3.5" />
          Company
        </span>
        <SearchableDropdown
          options={[{ label: "All companies", value: "" }, ...companyOptions.map((company) => ({ label: company, value: company }))]}
          value={filters.company}
          onChange={(value) => handleFilterChange("company", value)}
          placeholder="All companies"
          loading={companiesLoading}
        />
      </label>

      <label className="block space-y-2">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          <UserRound className="h-3.5 w-3.5" />
          Author
        </span>
        <SearchableDropdown
          options={[{ label: "All authors", value: "" }, ...authorOptions]}
          value={filters.author}
          onChange={(value) => handleFilterChange("author", value)}
          placeholder="All authors"
          loading={authorsLoading}
        />
      </label>

      <label className="block space-y-2">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          College
        </span>
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
      </label>

      <label className="block space-y-2">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          <GraduationCap className="h-3.5 w-3.5" />
          Department
        </span>
        <SearchableDropdown
          options={[{ label: "All departments", value: "" }, ...BRANCH_OPTIONS]}
          value={filters.branch}
          onChange={(value) => handleFilterChange("branch", value)}
          placeholder="All departments"
        />
      </label>

      <label className="block space-y-2">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          Year
        </span>
        <SearchableDropdown
          options={[{ label: "All years", value: "" }, ...YEAR_OPTIONS.map((year) => ({ label: year, value: year }))]}
          value={filters.batch}
          onChange={(value) => handleFilterChange("batch", value)}
          placeholder="All years"
        />
      </label>
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-x-clip bg-slate-50 font-sans dark:bg-slate-950">
      <Navbar showThemeToggle />
      {isShareButtonLoading && <LoadingScreen isDarkMode={isDarkMode} />}

      <div className="relative mx-auto max-w-[800px] px-4 pb-14 pt-20 sm:px-6 md:pt-24">
        <div className="relative">
          <aside className="hidden xl:absolute xl:bottom-0 xl:right-[calc(100%+20px)] xl:top-0 xl:block xl:w-[300px]">
          <div className="space-y-3 xl:sticky xl:top-24">
          <div className="flex items-center gap-2">
            <div className="inline-flex min-w-0 flex-1 items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/50">
              {[
                { value: "latest", label: "Latest", icon: Clock },
                { value: "trending", label: "Trending", icon: Zap },
                { value: "random", label: "Feed", icon: RefreshCw },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value)}
                  className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-2 text-xs font-semibold transition ${activeTab === value
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => fetchProfiles(0, itemsPerPage, activeTab, filters, true)}
              disabled={pageLoading}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              title="Refresh feed"
              aria-label="Refresh feed"
            >
              <RefreshCw className={`h-4 w-4 ${pageLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Refine The Feed</span>
              </div>
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {renderFilterFields()}
            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          </div>
          </div>
          </aside>

          <aside className="mb-5 xl:absolute xl:bottom-0 xl:left-[calc(100%+20px)] xl:top-0 xl:mb-0 xl:w-[300px]">
          <div className="space-y-3 xl:sticky xl:top-24">
          <Link
            href="/post?type=interview"
            onClick={handleShareExperienceClick}
            prefetch={true}
            scroll={false}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Send className="h-4 w-4" />
            Post Your Story
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 [&>div]:mb-0">
            <FeedHero isDarkMode={isDarkMode} />
          </div>
          </div>
          </aside>

          <div className="min-w-0">
          <div className="sticky top-[59px] z-30 mb-4 bg-slate-50/95 py-2 backdrop-blur-md dark:bg-slate-950/95">
            <FeedSearch onSearchChange={handleSearchChange} />
          </div>
          <section className="xl:hidden">
          {/* Header & Tabs */}
          <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
            {/* Tab Switcher */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/50">
                <button
                  onClick={() => setActiveTab("latest")}
                  className={`relative inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all ${activeTab === "latest"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  <Clock size={16} />
                  Latest
                </button>
                <button
                  onClick={() => setActiveTab("trending")}
                  className={`relative inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all ${activeTab === "trending"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  <Zap size={16} />
                  Trending
                </button>
                <button
                  onClick={() => setActiveTab("random")}
                  className={`relative inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all ${activeTab === "random"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  <RefreshCw size={16} />
                  Feed
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchProfiles(0, itemsPerPage, activeTab, filters, true)}
                  disabled={pageLoading}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  title="Refresh feed"
                  aria-label="Refresh feed"
                >
                  <RefreshCw className={`h-4 w-4 ${pageLoading ? "animate-spin" : ""}`} />
                </button>
                <Link
                  href="/post?type=interview"
                  onClick={handleShareExperienceClick}
                  prefetch={true}
                  scroll={false}
                  className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 sm:flex-none sm:py-2 sm:text-sm"
                >
                  <Send className="h-4 w-4" />
                  Post Your Story
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative z-20 rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/20 xl:hidden">
            <div className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${filtersOpen ? "border-b border-slate-100 dark:border-slate-800" : ""}`}>
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className="flex items-center gap-2.5 text-left"
                aria-expanded={filtersOpen}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Refine The Feed</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
              </button>

              <div className="flex items-center gap-2">
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

            {filtersOpen && (
              <div className="p-4 sm:p-5">{renderFilterFields()}</div>
            )}
          </div>
        </section>

        <div className="mt-4 space-y-2.5">
          {pageLoading && page === 0 && profiles.length === 0 ? (
            skeletonCards.map((_, index) => <ProfileCardSkeleton key={index} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {profiles.map((profile, index) => (
                <motion.div
                  key={profile._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.28, delay: (index % 10) * 0.025 }}
                >
                  <FeedPostCard profile={profile} />
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
          </div>
        </div>
      </div>
    </main>
  );
}
