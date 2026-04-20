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

const ITEMS_PER_PAGE = 10;

export default function TalesPage() {
  const [tales, setTales] = useState([]);
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState("random");
  const [pageLoading, setPageLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const observer = useRef(null);
  const isFetchingRef = useRef(false);

  const fetchTales = useCallback(async (pageNumber, sort, excludedTaleIds = []) => {
    if (isFetchingRef.current && pageNumber > 0) return;

    setPageLoading(true);
    isFetchingRef.current = true;

    try {
      const params = new URLSearchParams({
        page: String(pageNumber),
        itemsPerPage: String(ITEMS_PER_PAGE),
        sort,
        contentType: "tale",
        _ts: Date.now().toString(),
      });
      if (searchQuery) params.set("q", searchQuery);
      if (sort === "random" && pageNumber > 0 && excludedTaleIds.length > 0) {
        params.set("exclude", excludedTaleIds.join(","));
      }

      const response = await fetch(`/api/feed?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tales");
      }

      const incoming = await response.json();
      const nextTales = Array.isArray(incoming) ? incoming : [];

      setTales((prev) => {
        if (pageNumber === 0) return nextTales;
        const combined = [...prev, ...nextTales];
        return [...new Map(combined.map((item) => [item._id || item.uid, item])).values()];
      });
      setHasMore(nextTales.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching tales:", error);
      if (pageNumber === 0) setTales([]);
      setHasMore(false);
    } finally {
      setPageLoading(false);
      isFetchingRef.current = false;
    }
  }, [searchQuery]);

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
              <Link
                href="/post/tale"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
              >
                <Send className="h-4 w-4" />
                Share Your Story
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 [&>div]:mb-0">
                <FeedHero contentType="tale" />
              </div>
            </div>
          </aside>

          <div className="sticky top-[59px] z-30 mb-4 bg-slate-50/95 py-2 backdrop-blur-md dark:bg-slate-950/95">
            <FeedSearch contentType="tale" onSearchChange={handleSearchChange} />
          </div>

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
              <Link href="/post/tale" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white sm:flex-none">
                <Send className="h-4 w-4" />
                Share Your Story
              </Link>
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
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 dark:bg-slate-800/50 dark:text-slate-600">
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
