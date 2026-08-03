"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, Send, Sparkles, Clock, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import FeedPostCard from "../../components/FeedPostCard";
import ProfileCardSkeleton from "../../components/ProfileCardSkeleton";

const ITEMS_PER_PAGE = 10;

export default function TalesPage() {
  const [tales, setTales] = useState([]);
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState("latest");
  const [pageLoading, setPageLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);
  const isFetchingRef = useRef(false);

  const fetchTales = useCallback(async (pageNumber, sort) => {
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
  }, []);

  useEffect(() => {
    setTales([]);
    setPage(0);
    setHasMore(true);
    fetchTales(0, activeTab);
  }, [activeTab, fetchTales]);

  useEffect(() => {
    if (page === 0) return;
    fetchTales(page, activeTab);
  }, [page, activeTab, fetchTales]);

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

  return (
    <main className="relative min-h-screen overflow-x-clip bg-slate-50 font-sans dark:bg-slate-950">
      <Navbar showThemeToggle />

      <div className="relative mx-auto max-w-[800px] px-4 pb-14 pt-24 mt-8 sm:px-6 md:pt-32 md:mt-12">
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:border-blue-950 dark:bg-blue-950/50 dark:text-blue-400">
                <BookOpen className="h-3 w-3" />
                Share Your Story
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Real Stories, Real <span className="text-blue-600 dark:text-blue-500">Experiences</span> Worth Sharing
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Hackathons, general events, project journeys, lessons learned, wins, and failures.
              </p>
            </div>

            <Link
              href="/post/tale"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 md:self-auto"
            >
              <Send className="h-4 w-4" />
              Share your story
            </Link>
          </div>
        </section>


        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/50">
                <button
                  onClick={() => setActiveTab("latest")}
                  className={`relative inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all ${activeTab === "latest"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  <Clock className="h-4 w-4" />
                  Latest
                </button>
                <button
                  onClick={() => setActiveTab("trending")}
                  className={`relative inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all ${activeTab === "trending"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  <Sparkles className="h-4 w-4" />
                  Trending
                </button>
                <button
                  onClick={() => setActiveTab("random")}
                  className={`relative inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all ${activeTab === "random"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  <RefreshCw className="h-4 w-4" />
                  Feed
                </button>
              </div>

              {tales.length > 0 && (
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  <BookOpen className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                  {tales.length} loaded
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-4 space-y-2.5">
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
    </main>
  );
}
