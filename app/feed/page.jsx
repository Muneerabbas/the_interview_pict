"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Compass,
  Filter,
  Home,
  Lightbulb,
  PlusCircle,
  TrendingUp,
  User,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FeedExperienceCard from "@/components/FeedExperienceCard";

function normalizeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function formatViews(value) {
  const views = Number(value) || 0;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return String(views);
}

function FeedCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border-dark/80 bg-surface-dark md:flex-row">
      <div className="feed-shimmer h-52 w-full md:h-[280px] md:w-[320px]" />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="feed-shimmer size-11 rounded-full" />
            <div className="space-y-2">
              <div className="feed-shimmer h-3 w-28 rounded" />
              <div className="feed-shimmer h-3 w-36 rounded" />
            </div>
          </div>
          <div className="feed-shimmer h-6 w-20 rounded" />
        </div>
        <div className="space-y-3">
          <div className="feed-shimmer h-5 w-3/4 rounded" />
          <div className="feed-shimmer h-4 w-full rounded" />
          <div className="feed-shimmer h-4 w-5/6 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="feed-shimmer h-6 w-24 rounded-full" />
          <div className="feed-shimmer h-6 w-20 rounded-full" />
          <div className="feed-shimmer h-6 w-16 rounded-full" />
        </div>
        <div className="feed-shimmer mt-auto h-px" />
      </div>
    </div>
  );
}

function FeedLoadingBar() {
  return (
    <div className="rounded-xl border border-border-dark/70 bg-surface-dark/80 p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wider text-slate-400">
        <span>Loading experiences</span>
        <span className="text-primary">Please wait</span>
      </div>
      <div className="feed-progress-track h-2 w-full rounded-full bg-slate-800" />
    </div>
  );
}

export default function FeedPage() {
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const itemsPerPage = 10;

  const observer = useRef(null);

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed request: ${url} (${response.status})`);
    }
    return response.json();
  }

  async function loadFeedPage(pageNumber) {
    const localUrl = `/api/feed?page=${pageNumber}&itemsPerPage=${itemsPerPage}`;
    const topStoriesUrl = `/api/topStories?page=${pageNumber}`;

    try {
      const localData = await fetchJson(localUrl);
      if (Array.isArray(localData) && localData.length > 0) {
        return localData;
      }
    } catch (error) {
      console.warn("Local feed fetch failed, trying top stories fallback.", error);
    }

    try {
      const topStories = await fetchJson(topStoriesUrl);
      if (Array.isArray(topStories) && topStories.length > 0) {
        return topStories.slice(0, itemsPerPage);
      }
    } catch (error) {
      console.warn("Top stories fallback failed.", error);
    }

    return [];
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchProfiles() {
      setPageLoading(true);
      try {
        const data = await loadFeedPage(page);
        if (cancelled) return;

        if (Array.isArray(data) && data.length > 0) {
          setProfiles((prev) => {
            const unique = new Map();
            [...prev, ...data].forEach((item) => unique.set(item?._id || item?.uid, item));
            return Array.from(unique.values());
          });
          if (data.length < itemsPerPage) setHasMoreProfiles(false);
        } else {
          setHasMoreProfiles(false);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
        if (!cancelled) setHasMoreProfiles(false);
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    }

    fetchProfiles();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const lastProfileElementRef = (node) => {
    if (pageLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasMoreProfiles) {
        setPage((prev) => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  };

  const trendingCompanies = useMemo(() => {
    const counter = new Map();
    profiles.forEach((profile) => {
      const company = normalizeText(profile?.company);
      if (!company) return;
      counter.set(company, (counter.get(company) || 0) + 1);
    });

    return Array.from(counter.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [profiles]);

  return (
    <main className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Navbar />

      <section className="flex flex-1 justify-center px-4 py-8 sm:px-10 lg:px-20 xl:px-40">
        <div className="flex max-w-[1400px] flex-1 gap-8">
          <div className="layout-content-container flex max-w-[960px] flex-1 flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Link
                href="/post"
                className="group flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-primary px-6 text-white shadow-[0_8px_30px_rgba(13,127,242,0.2)] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
              >
                <PlusCircle size={18} className="transition-transform group-hover:scale-110" />
                <span className="text-base font-bold">Share Your Interview Experience</span>
              </Link>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-100">Recent Interview Experiences</h2>
                <p className="text-sm text-slate-500">Stay updated with the latest community insights</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-xl border border-border-dark bg-surface-dark p-2.5 text-slate-400 transition-all hover:border-primary/30 hover:text-primary" aria-label="Filter experiences">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {pageLoading && profiles.length === 0 && (
                <>
                  <FeedCardSkeleton />
                  <FeedCardSkeleton />
                </>
              )}

              {profiles.map((profile, index) => {
                const key = profile?._id || profile?.uid || `profile-${index}`;
                if (profiles.length === index + 2) {
                  return (
                    <div ref={lastProfileElementRef} key={key}>
                      <FeedExperienceCard profile={profile} />
                    </div>
                  );
                }
                return <FeedExperienceCard key={key} profile={profile} />;
              })}

              {!pageLoading && profiles.length === 0 && (
                <div className="rounded-xl border border-border-dark bg-surface-dark p-10 text-center text-slate-400">
                  No experiences available yet. Be the first one to share your interview journey.
                </div>
              )}

              {pageLoading && profiles.length > 0 && (
                <FeedLoadingBar />
              )}
            </div>

            <div className="flex justify-center py-6">
              <button
                disabled={pageLoading || !hasMoreProfiles}
                onClick={() => setPage((prev) => prev + 1)}
                className="flex items-center gap-2 rounded-xl border border-border-dark px-10 py-3.5 font-bold text-slate-300 shadow-sm transition-all hover:border-primary/30 hover:bg-surface-dark hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{hasMoreProfiles ? "Load More Experiences" : "No More Experiences"}</span>
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          <aside className="sticky top-24 ml-8 hidden h-fit w-80 shrink-0 flex-col gap-6 self-start xl:flex">
            <div className="rounded-xl border border-border-dark bg-surface-dark p-6 shadow-md">
              <div className="mb-5 flex items-center justify-between">
                <h4 className="font-bold text-slate-100">Trending Companies</h4>
                <TrendingUp size={16} className="text-primary" />
              </div>

              <div className="flex flex-col gap-4">
                {(trendingCompanies.length ? trendingCompanies : [{ name: "Community", count: 0 }]).map((item) => (
                  <div key={item.name} className="group flex cursor-pointer items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl border border-border-dark bg-background-dark font-bold text-primary shadow-inner transition-colors group-hover:border-primary/50">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-300 transition-colors group-hover:text-primary">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{item.count} posts</span>
                  </div>
                ))}
              </div>

              <Link href="/search" className="mt-6 block w-full rounded-xl border border-primary/20 py-2.5 text-center text-xs font-bold text-primary transition-all hover:bg-primary/10">
                View all
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border-dark bg-surface-dark p-6 shadow-md">
              <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
              <h4 className="mb-4 flex items-center gap-2 font-bold text-slate-100">
                <TrendingUp size={14} className="text-primary" />
                Community Stats
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border-dark/30 bg-background-dark/50 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">New Today</p>
                  <p className="text-lg font-bold text-slate-100">+{Math.min(99, profiles.length || 0)}</p>
                </div>
                <div className="rounded-xl border border-border-dark/30 bg-background-dark/50 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Now</p>
                  <p className="text-lg font-bold text-slate-100">{formatViews((profiles.length || 0) * 12)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-dark bg-surface-dark p-6 shadow-md">
              <h4 className="mb-5 font-bold text-slate-100">Quick Prep Tips</h4>
              <div className="flex flex-col gap-5">
                <div className="group flex cursor-help gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Lightbulb size={18} className="text-primary" />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
                    Practice behavioral answers using the <span className="font-semibold text-primary">STAR method</span> for structured impact.
                  </p>
                </div>
                <div className="group flex cursor-help gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Compass size={18} className="text-primary" />
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
                    In coding rounds, clearly communicate trade-offs before choosing your final approach.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <footer className="sticky bottom-0 z-50 mt-auto border-t border-border-dark bg-surface-dark p-4 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around">
          <Link href="/" className="text-slate-400 transition-colors hover:text-primary"><Home size={20} /></Link>
          <Link href="/feed" className="text-primary [filter:drop-shadow(0_0_8px_rgba(13,127,242,0.4))]"><Compass size={20} /></Link>
          <Link href="/post" className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-[0_4px_12px_rgba(13,127,242,0.3)]"><PlusCircle size={18} className="text-white" /></Link>
          <button className="text-slate-400 transition-colors hover:text-primary" aria-label="Notifications"><Bell size={20} /></button>
          <Link href="/profile" className="text-slate-400 transition-colors hover:text-primary"><User size={20} /></Link>
        </div>
      </footer>
    </main>
  );
}
