"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, Send, Sparkles, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import FeedCard from "../../components/FeedCard";
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
    <main className="relative min-h-screen overflow-x-clip font-sans bg-transparent">
      <div className="fixed inset-0 -z-30 bg-[#f8fbff] dark:bg-[#020617]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(45,212,191,0.14),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1120_55%,#111827_100%)]" />
      </div>

      <div className="fixed inset-0 -z-20 pointer-events-none">
        <div className="absolute left-[-140px] top-24 h-[400px] w-[400px] rounded-full bg-sky-300/20 blur-[120px] dark:bg-sky-500/15" />
        <div className="absolute right-[-120px] top-[320px] h-[400px] w-[400px] rounded-full bg-indigo-300/20 blur-[120px] dark:bg-indigo-500/15" />
      </div>

      <div
        className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]"
        style={{
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.38),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.08),transparent_42%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.07),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(2,6,23,0.65),transparent_45%)]" />

      <div className="fixed inset-y-0 left-1/2 w-full max-w-[800px] -translate-x-1/2 -z-10 bg-slate-100/10 dark:bg-slate-900/20 pointer-events-none" />

      <Navbar showThemeToggle />

      <div className="relative mx-auto max-w-[800px] px-4 pb-14 pt-16 sm:px-6 md:pt-24">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/82 p-6 shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/76 dark:shadow-[0_16px_42px_rgba(2,6,23,0.62)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:border-cyan-500/25 dark:bg-cyan-950/35 dark:text-cyan-300">
                <BookOpen className="h-3.5 w-3.5" />
                Hackathon Takes
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-[2.5rem]">
                Stories in the same rhythm as the feed
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-[15px]">
                Project journeys, late-night fixes, team chaos, lessons, wins, and failures. Same reading flow as the main feed, focused on tales.
              </p>
            </div>

            <Link
              href="/post/tale"
              className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_14px_30px_rgba(37,99,235,0.28)] dark:bg-cyan-400 dark:text-slate-950 dark:shadow-[0_10px_24px_rgba(34,211,238,0.18)] dark:hover:bg-cyan-300 dark:hover:shadow-[0_14px_30px_rgba(34,211,238,0.22)] sm:self-auto"
            >
              <Send className="h-3.5 w-3.5" />
              Share your tale
            </Link>
          </div>
        </section>

        <div className="mb-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-slate-300 dark:via-slate-700 dark:to-slate-700" />
          <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/75 dark:text-slate-400">
            Tale Stories
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-300 via-slate-300 to-transparent dark:from-slate-700 dark:via-slate-700" />
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-[0_14px_40px_rgba(2,6,23,0.6)] sm:p-6">
          <div className="mb-6 border-b border-slate-200 pb-2 dark:border-slate-700">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex w-fit items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/85 p-1 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/75">
                <button
                  onClick={() => setActiveTab("latest")}
                  className={`relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold transition-all ${activeTab === "latest"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-cyan-300"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Latest
                </button>

                <button
                  onClick={() => setActiveTab("trending")}
                  className={`relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold transition-all ${activeTab === "trending"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-cyan-300"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Trending
                </button>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <BookOpen className="h-3.5 w-3.5" />
                {tales.length} loaded
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            {pageLoading && page === 0 && tales.length === 0 ? (
              skeletonCards.map((_, index) => <ProfileCardSkeleton key={index} />)
            ) : (
              <AnimatePresence mode="popLayout">
                {tales.map((tale, index) => (
                  <motion.div
                    key={tale._id || tale.uid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: (index % 10) * 0.03 }}
                  >
                    <FeedCard profile={tale} width="w-full" />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            <div ref={lastStoryElementRef} className="h-4 w-full" />

            {tales.length === 0 && !pageLoading && (
              <div className="py-12 text-center">
                <p className="font-medium italic text-slate-500 dark:text-slate-400">
                  No tales found yet.
                </p>
                <Link
                  href="/post/tale"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline dark:text-cyan-400"
                >
                  <Send className="h-4 w-4" />
                  Post the first tale
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
        </section>
      </div>
    </main>
  );
}
