"use client";

import Navbar from "../../components/Navbar";
import FeedCard from "../../components/FeedCard";
import FeedHero from "../../components/FeedHero";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { ArrowUpRight, Loader2, Send, Sparkles, Zap, Clock } from "lucide-react";
import Link from "next/link";
import ProfileCardSkeleton from "../../components/ProfileCardSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

const FEED_CACHE_PREFIX = "feed_state_v2";
const getFeedCacheKey = (tab) => `${FEED_CACHE_PREFIX}:${tab}`;

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
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState("latest"); // 'latest' or 'trending'
  const [pageLoading, setPageLoading] = useState(false);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const [isShareButtonLoading, setIsShareButtonLoading] = useState(false);
  const [tabReady, setTabReady] = useState(false);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDarkMode = mounted && resolvedTheme === "dark";

  const isFetchingRef = useRef(false);
  const skipNextFetchRef = useRef(false);
  const observer = useRef();
  const lastProfileElementRef = useCallback(
    (node) => {
      if (pageLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreProfiles && !isFetchingRef.current) {
            isFetchingRef.current = true;
            setPage((prevPage) => prevPage + 1);
          }
        },
        { rootMargin: "400px" } // Load even earlier
      );

      if (node) observer.current.observe(node);
    },
    [pageLoading, hasMoreProfiles]
  );

  const fetchProfiles = useCallback(async (pageNumber, limit, sort) => {
    setPageLoading(true);
    isFetchingRef.current = true;
    try {
      const url = `/api/feed?page=${pageNumber}&itemsPerPage=${limit}&sort=${sort}`;
      const response = await axios.get(url);

      // Safety check: only update state if this request matches the current active tab
      if (sort !== activeTab) return;

      if (response.data && response.data.length > 0) {
        setProfiles((prev) => {
          const incoming = response.data;
          // If it's page 0, we don't need to concat
          if (pageNumber === 0) return incoming;
          const uniqueProfiles = [...new Map(prev.concat(incoming).map((item) => [item._id, item])).values()];
          return uniqueProfiles;
        });
        if (response.data.length < limit) {
          setHasMoreProfiles(false);
        }
      } else {
        setHasMoreProfiles(false);
        if (pageNumber === 0) {
          setProfiles([]);
        }
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      setHasMoreProfiles(false);
    } finally {
      setPageLoading(false);
      isFetchingRef.current = false;
    }
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let restored = false;
    try {
      const cached = sessionStorage.getItem(getFeedCacheKey(activeTab));
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheAge = Date.now() - (parsed.timestamp || 0);

        // Only use cache if it was saved within the last 5 minutes
        if (cacheAge < 5 * 60 * 1000) {
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
          sessionStorage.removeItem(getFeedCacheKey(activeTab));
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
  }, [activeTab]);

  useEffect(() => {
    if (!tabReady) return;
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    fetchProfiles(page, itemsPerPage, activeTab);
  }, [tabReady, page, activeTab, fetchProfiles, itemsPerPage]);

  useEffect(() => {
    if (!tabReady || typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        getFeedCacheKey(activeTab),
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
  }, [profiles, page, hasMoreProfiles, activeTab, tabReady]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saveScroll = () => {
      try {
        const cached = sessionStorage.getItem(getFeedCacheKey(activeTab));
        if (!cached) return;
        const parsed = JSON.parse(cached);
        sessionStorage.setItem(
          getFeedCacheKey(activeTab),
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
  }, [activeTab]);

  const skeletonCards = Array.from({ length: 3 });

  const handleShareExperienceClick = () => {
    setIsShareButtonLoading(true);
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

      {/* Center Reading Track */}
      <div className="fixed inset-y-0 left-1/2 w-full max-w-[800px] -translate-x-1/2 -z-10 bg-slate-100/10 dark:bg-slate-900/20 pointer-events-none" />

      <Navbar showThemeToggle />
      {isShareButtonLoading && <LoadingScreen isDarkMode={isDarkMode} />}

      <div className="relative mx-auto max-w-[800px] px-4 pb-14 pt-16 sm:px-6 md:pt-24">
        {/* Post Button Row */}
        <div className="mb-8 mt-3 flex justify-end sm:mt-5">
          <Link
            href="/post"
            onClick={handleShareExperienceClick}
            prefetch={true}
            scroll={false}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/35 transition hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-blue-500/50 active:scale-95 dark:bg-cyan-500 dark:shadow-cyan-500/30 dark:hover:bg-cyan-400"
          >
            <Send className="h-4 w-4" />
            Post Your Story
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Hero Section */}
        <FeedHero isDarkMode={isDarkMode} />

        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-[0_14px_40px_rgba(2,6,23,0.6)] sm:p-6">
          {/* Header & Tabs */}
          <div className="mb-6 border-b border-slate-200 pb-2 dark:border-slate-700">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">Interview Feed</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Discover experiences from top candidates.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/60 bg-teal-500 px-3 py-1 text-xs font-semibold text-white shadow-sm dark:border-teal-400/40 dark:bg-teal-600">
                <Sparkles className="h-3.5 w-3.5" />
                Community powered
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("latest")}
                className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative ${activeTab === "latest"
                  ? "text-blue-600 dark:text-cyan-400"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  }`}
              >
                <Clock size={16} />
                Latest
                {activeTab === "latest" && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-cyan-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("trending")}
                className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative ${activeTab === "trending"
                  ? "text-blue-600 dark:text-cyan-400"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  }`}
              >
                <Zap size={16} />
                Trending
                {activeTab === "trending" && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-cyan-400" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
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
              <div className="py-12 text-center">
                <p className="text-slate-500 dark:text-slate-400 font-medium italic">No stories found for this category.</p>
                <button
                  onClick={() => { setActiveTab("latest") }}
                  className="mt-4 text-sm font-bold text-blue-600 hover:underline dark:text-cyan-400"
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
