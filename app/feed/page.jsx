"use client";

import Navbar from "../../components/Navbar";
import FeedCard from "../../components/FeedCard";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { ArrowUpRight, Loader2, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import ProfileCardSkeleton from "../../components/ProfileCardSkeleton";
import { motion, AnimatePresence } from "framer-motion";

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
  const [pageLoading, setPageLoading] = useState(false);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const [isShareButtonLoading, setIsShareButtonLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeHydrated, setThemeHydrated] = useState(false);

  const observer = useRef();
  const lastProfileElementRef = useCallback(
    (node) => {
      if (pageLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreProfiles) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [pageLoading, hasMoreProfiles]
  );

  const fetchProfiles = async (pageNumber, limit) => {
    setPageLoading(true);
    try {
      const response = await axios.get(`/api/feed?page=${pageNumber}&itemsPerPage=${limit}`);
      if (response.data && response.data.length > 0) {
        setProfiles((prev) => {
          const uniqueProfiles = [...new Map(prev.concat(response.data).map((item) => [item._id, item])).values()];
          return uniqueProfiles;
        });
        if (response.data.length < limit) {
          setHasMoreProfiles(false);
        }
      } else {
        setHasMoreProfiles(false);
        if (pageNumber === 0 && response.data.length === 0) {
          setProfiles([]);
        }
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      setHasMoreProfiles(false);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    setHasMoreProfiles(true);
    fetchProfiles(page, itemsPerPage);
  }, [page, itemsPerPage]);

  useEffect(() => {
    const storedFeedTheme = window.localStorage.getItem("feed-theme");
    const storedGlobalTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDarkMode = storedFeedTheme
      ? storedFeedTheme === "dark"
      : storedGlobalTheme
        ? storedGlobalTheme === "dark"
        : prefersDark;
    setIsDarkMode(initialDarkMode);
    setThemeHydrated(true);
  }, []);

  useEffect(() => {
    if (!themeHydrated) return;
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("feed-theme", isDarkMode ? "dark" : "light");
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode, themeHydrated]);

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

      <Navbar showThemeToggle isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode((prev) => !prev)} />
      {isShareButtonLoading && <LoadingScreen isDarkMode={isDarkMode} />}

      <div className="relative mx-auto max-w-[800px] px-4 pb-14 pt-16 sm:px-6 md:pt-24">
        <div className="mb-6 flex justify-end">
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

        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-[0_14px_40px_rgba(2,6,23,0.6)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">Latest Experiences</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Newest stories first, with live loading.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/60 bg-teal-500 px-3 py-1 text-xs font-semibold text-white shadow-sm dark:border-teal-400/40 dark:bg-teal-600">
              <Sparkles className="h-3.5 w-3.5" />
              Community powered
            </div>
          </div>

          <div className="space-y-4">
            {pageLoading && page === 0 && profiles.length === 0 ? (
              skeletonCards.map((_, index) => <ProfileCardSkeleton key={index} />)
            ) : (
              <AnimatePresence>
                {profiles.map((profile, index) => {
                  const shouldObserve = profiles.length === index + 2;
                  return (
                    <motion.div
                      key={profile._id}
                      ref={shouldObserve ? lastProfileElementRef : null}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.42, delay: (index % 8) * 0.04 }}
                    >
                      <FeedCard profile={profile} width="w-full" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <div className="mt-12 flex flex-col items-center space-y-4 pb-2">
            {pageLoading && page !== 0 && (
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

            {!pageLoading && !hasMoreProfiles && profiles.length === 0 && page === 0 && (
              <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No experiences posted yet.</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start the feed by sharing your own interview story.</p>
                <Link
                  href="/post"
                  onClick={handleShareExperienceClick}
                  prefetch={true}
                  scroll={false}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                >
                  Share the first story
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
