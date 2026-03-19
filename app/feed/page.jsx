"use client";

import Navbar from "../../components/Navbar";
import FeedCard from "../../components/FeedCard";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { ArrowUpRight, Loader2, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import ProfileCardSkeleton from "../../components/ProfileCardSkeleton";
import { motion, AnimatePresence } from "framer-motion";

const LoadingScreen = () => (
  <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-white/80 backdrop-blur-sm">
    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
  </div>
);

export default function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;
  const [pageLoading, setPageLoading] = useState(false);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const [isShareButtonLoading, setIsShareButtonLoading] = useState(false);

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

  const skeletonCards = Array.from({ length: 3 });

  const handleShareExperienceClick = () => {
    setIsShareButtonLoading(true);
  };

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] pt-5 font-sans md:pt-20">
      <Navbar />
      {isShareButtonLoading && <LoadingScreen />}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)]" />

      <div className="pointer-events-none absolute left-[-140px] top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[320px] h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6">
        <section className="mb-8 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Real interview stories, straight from candidates
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Browse concise experiences, patterns, and tips from recent interviews. Scroll to discover what different roles
              and companies are actually asking.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-[0_12px_32px_rgba(37,99,235,0.3)]">
              <h2 className="text-xl font-bold leading-tight">Share your interview experience</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100">
                One honest story can save someone hours of guesswork and boost confidence before the big day.
              </p>
              <Link
                href="/post"
                onClick={handleShareExperienceClick}
                prefetch={true}
                scroll={false}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              >
                <Send className="h-4 w-4" />
                Post Your Story
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Latest Experiences</h2>
              <p className="text-sm text-slate-500">Newest stories first, with live loading.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Community powered
            </div>
          </div>

          <div className="space-y-6">
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
              <div className="flex items-center space-x-3 rounded-full border border-indigo-100 bg-white px-6 py-3 text-indigo-600 shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-semibold">Loading more experiences...</span>
              </div>
            )}

            {!pageLoading && !hasMoreProfiles && profiles.length > 0 && (
              <div className="flex w-full items-center justify-center py-6">
                <div className="h-[1px] flex-1 bg-slate-200" />
                <span className="px-4 text-xs font-bold uppercase tracking-widest text-slate-400">You have reached the end</span>
                <div className="h-[1px] flex-1 bg-slate-200" />
              </div>
            )}

            {!pageLoading && !hasMoreProfiles && profiles.length === 0 && page === 0 && (
              <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-700">No experiences posted yet.</p>
                <p className="mt-2 text-sm text-slate-500">Start the feed by sharing your own interview story.</p>
                <Link
                  href="/post"
                  onClick={handleShareExperienceClick}
                  prefetch={true}
                  scroll={false}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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
