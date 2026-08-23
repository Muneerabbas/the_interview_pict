"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Loader2, Send, Sparkles, Clock, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import FeedPostCard from "../../components/FeedPostCard";
import FeedHero from "../../components/FeedHero";
import ProfileCardSkeleton from "../../components/ProfileCardSkeleton";
import FeedSearch from "../../components/FeedSearch";
import { requestJson } from "../../lib/client-api";
import { TALE_CATEGORIES } from "../../lib/tale-categories";

const ITEMS_PER_PAGE = 10;

const ShareStoryCard = ({ compact = false }) => (
  <Link
    href="/post/tale"
    className={`group relative isolate overflow-hidden rounded-xl border border-l-2 border-slate-200 border-l-blue-500 bg-white text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:border-l-blue-600 hover:shadow-md dark:border-slate-700 dark:border-l-blue-400 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:border-l-blue-300 ${compact ? "flex min-w-0 flex-1 items-center p-2.5 sm:flex-none sm:px-4" : "block p-4"}`}
  >
    <span className={`relative flex ${compact ? "items-center gap-2.5" : "items-start gap-3"}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300">
        <Send className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">
          Community stories
        </span>
        <span className="mt-1 block truncate text-sm font-bold tracking-tight">
          Share Your Story
        </span>
        {!compact && (
          <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Share what you built, learned, or overcame.
          </span>
        )}
      </span>
      <ArrowUpRight className="relative mt-1 h-4 w-4 shrink-0 text-blue-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-blue-300" />
    </span>
  </Link>
);

export default function TalesPage() {
  const [tales, setTales] = useState([]);
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState("random");
  const [pageLoading, setPageLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [college, setCollege] = useState("");
  const [authorOptions, setAuthorOptions] = useState([]);
  const observer = useRef(null);
  const isFetchingRef = useRef(false);
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  const fetchTales = useCallback(async (pageNumber, sort, excludedTaleIds = []) => {
    if (isFetchingRef.current && pageNumber > 0) return;

    setPageLoading(true);
    isFetchingRef.current = true;
    const requestId = ++requestIdRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const params = new URLSearchParams({
        page: String(pageNumber),
        itemsPerPage: String(ITEMS_PER_PAGE),
        sort,
        contentType: "tale",
        _ts: Date.now().toString(),
      });
      if (searchQuery) params.set("q", searchQuery);
      if (category) params.set("category", category);
      if (author) params.set("author", author);
      if (college.trim()) params.set("college", college.trim());
      if (sort === "random" && pageNumber > 0 && excludedTaleIds.length > 0) {
        params.set("exclude", excludedTaleIds.join(","));
      }

      const response = await fetch(`/api/feed?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      const incoming = await requestJson(response, {}, []);
      if (requestId !== requestIdRef.current) return;
      const nextTales = Array.isArray(incoming) ? incoming : [];

      setTales((prev) => {
        if (pageNumber === 0) return nextTales;
        const combined = [...prev, ...nextTales];
        return [...new Map(combined.map((item) => [item._id || item.uid, item])).values()];
      });
      setHasMore(nextTales.length === ITEMS_PER_PAGE);
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Error fetching tales:", error);
      if (pageNumber === 0) setTales([]);
      setHasMore(false);
    } finally {
      if (requestId === requestIdRef.current) {
        setPageLoading(false);
        isFetchingRef.current = false;
      }
    }
  }, [searchQuery, category, author, college]);

  useEffect(() => {
    let cancelled = false;
    requestJson("/api/feed?options=authors&contentType=tale", {}, []).then((authors) => {
      if (!cancelled) setAuthorOptions(Array.isArray(authors) ? authors : []);
    }).catch(() => {
      if (!cancelled) setAuthorOptions([]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setTales([]);
    setPage(0);
    setHasMore(true);
    fetchTales(0, activeTab);
  }, [activeTab, fetchTales]);

  useEffect(() => {
    if (page === 0) return;
    fetchTales(page, activeTab, tales.map((tale) => tale._id));
  }, [page, activeTab, fetchTales]);

  const refreshTales = () => {
    setTales([]);
    setPage(0);
    setHasMore(true);
    fetchTales(0, activeTab);
  };

  const handleSearchChange = useCallback((value) => {
    setTales([]);
    setPage(0);
    setHasMore(true);
    setSearchQuery(value);
  }, []);

  const clearFilters = () => {
    setCategory("");
    setAuthor("");
    setCollege("");
    setTales([]);
    setPage(0);
    setHasMore(true);
  };

  const lastStoryElementRef = useCallback(
    (node) => {
      if (pageLoading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isFetchingRef.current && tales.length > 0) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { rootMargin: "400px" }
      );

      if (node) observer.current.observe(node);
    },
    [pageLoading, hasMore, tales.length]
  );

  // Never disconnected on unmount: the observer kept the last sentinel node and
  // its callback closure alive after navigating away.
  useEffect(() => () => observer.current?.disconnect(), []);


  const skeletonCards = Array.from({ length: 3 });

  const renderTabs = (compact = false) => (
    <div className={`inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/50 ${compact ? "min-w-0 flex-1" : "w-fit"}`}>
      {[
        { value: "latest", label: "Latest", icon: Clock },
        { value: "trending", label: "Trending", icon: Sparkles },
        { value: "random", label: "Feed", icon: RefreshCw },
      ].map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setActiveTab(value)}
          className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md font-semibold transition ${compact ? "flex-1 px-1.5 py-2 text-xs" : "px-3.5 py-1.5 text-sm"} ${activeTab === value
            ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-x-clip bg-slate-50 font-sans dark:bg-slate-950">
      <Navbar showThemeToggle />

      <div className="relative mx-auto max-w-[800px] px-4 pb-14 pt-20 sm:px-6 md:pt-24">
        <div className="relative">
          <aside className="hidden xl:absolute xl:bottom-0 xl:right-[calc(100%+20px)] xl:top-0 xl:block xl:w-[300px]">
            <div className="flex items-center gap-2 xl:sticky xl:top-24">
              {renderTabs(true)}
              <button
                type="button"
                onClick={refreshTales}
                disabled={pageLoading}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                title="Refresh tales"
                aria-label="Refresh tales"
              >
                <RefreshCw className={`h-4 w-4 ${pageLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </aside>

          <aside className="mb-5 xl:absolute xl:bottom-0 xl:left-[calc(100%+20px)] xl:top-0 xl:mb-0 xl:w-[300px]">
            <div className="space-y-3 xl:sticky xl:top-24">
              <ShareStoryCard />
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 [&>div]:mb-0">
                <FeedHero contentType="tale" layout="responsive" />
              </div>
            </div>
          </aside>

          <div className="sticky top-[59px] z-30 mb-4 bg-slate-50/95 py-2 backdrop-blur-md dark:bg-slate-950/95">
            <FeedSearch contentType="tale" onSearchChange={handleSearchChange} />
          </div>

          <header className="mb-5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Student Tales, Projects &amp; Hackathon Stories
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Discover authentic stories about building, competing, working, and learning from setbacks.
            </p>
          </header>

          <section className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Explore tales</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Filter stories by topic, author, or college.</p>
              </div>
              {(category || author || college) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Category
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="">All categories</option>
                  {TALE_CATEGORIES.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Author
                <select
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="">All authors</option>
                  {authorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                College
                <input
                  type="search"
                  value={college}
                  onChange={(event) => setCollege(event.target.value)}
                  placeholder="Search college"
                  maxLength={80}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
            </div>
          </section>

          <section className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 xl:hidden sm:flex-row sm:items-center sm:justify-between">
            {renderTabs()}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refreshTales}
                disabled={pageLoading}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                aria-label="Refresh tales"
              >
                <RefreshCw className={`h-4 w-4 ${pageLoading ? "animate-spin" : ""}`} />
              </button>
              <ShareStoryCard compact />
            </div>
          </section>

          <div className="space-y-2.5">
          {pageLoading && page === 0 && tales.length === 0 ? (
            skeletonCards.map((_, index) => <ProfileCardSkeleton key={index} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {tales.map((tale, index) => (
                <motion.div
                  key={tale._id || tale.uid}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.28, delay: (index % 10) * 0.025 }}
                >
                  <FeedPostCard profile={tale} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

            <div ref={lastStoryElementRef} className="h-4 w-full" />

            {tales.length === 0 && !pageLoading && (
              <div className="py-20 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-50 text-slate-300 dark:bg-slate-800/50 dark:text-slate-600">
                  <BookOpen size={32} />
                </div>
                <p className="text-base font-medium text-slate-500 dark:text-slate-400">
                  No tales found yet. Be the first to share the rhythm!
                </p>
                <Link
                  href="/post/tale"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  <Send className="h-4 w-4" />
                  Post your story
                </Link>
              </div>
            )}

            {pageLoading && tales.length > 0 && (
              <div className="flex items-center justify-center py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more tales...
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
