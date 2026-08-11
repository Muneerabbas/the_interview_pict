"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, Heart, TrendingUp } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";
import { requestJson } from "@/lib/client-api";

const MiniTrendingCard = ({ profile }) => {
    const isTale = profile?.content_type === "tale";
    const name = resolveProfileName(profile);
    const pic = resolveProfileImage(profile);
    const community = isTale ? "Tales" : profile?.company || "Interview";
    const sub = isTale ? profile?.college || "Tale" : profile?.role || "Interview";
    const title = isTale
        ? profile?.title || "Untitled tale"
        : profile?.title || `${profile?.company || "Company"} Interview Experience`;
    const href = `/single/${profile?.uid || profile?._id}`;
    const likeCount = Array.isArray(profile?.likes) ? profile.likes.length : 0;

    return (
        <Link
            href={href}
            prefetch
            className="flex min-w-0 w-full flex-col rounded-xl border border-slate-200 bg-white p-3 transition duration-150 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
        >
            <div className="flex items-center gap-2.5">
                <ProfileAvatar
                    src={pic}
                    name={name}
                    alt={name}
                    className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                />
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {community} · {sub}
                    </p>
                </div>
            </div>
            <p className="mt-2.5 line-clamp-1 text-[13px] font-medium text-slate-700 dark:text-slate-200">
                {title}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <span className="inline-flex items-center gap-1">
                    <Eye size={12} />
                    {Number(profile?.views) || 0}
                </span>
                <span className="inline-flex items-center gap-1">
                    <Heart size={12} />
                    {likeCount}
                </span>
            </div>
        </Link>
    );
};

const FeedHero = ({ isDarkMode, contentType = "interview", layout = "sidebar" }) => {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [isWideLayout, setIsWideLayout] = useState(false);

    useEffect(() => {
        if (layout !== "responsive") return undefined;

        const mediaQuery = window.matchMedia("(min-width: 1280px)");
        const updateLayout = () => {
            setIsWideLayout(mediaQuery.matches);
            setPage(0);
        };

        updateLayout();
        mediaQuery.addEventListener("change", updateLayout);
        return () => mediaQuery.removeEventListener("change", updateLayout);
    }, [layout]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchTrending = async () => {
            try {
                const data = await requestJson(`/api/feed?sort=trending&itemsPerPage=8&contentType=${contentType}`, { signal: controller.signal }, []);
                setTrending(Array.isArray(data) ? data : []);
                setPage(0);
            } catch (err) {
                if (err?.name === "AbortError") return;
                console.error("Failed to fetch trending:", err);
                setTrending([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        fetchTrending();
        return () => controller.abort();
    }, [contentType]);

    const isSidebar = layout === "sidebar" || (layout === "responsive" && isWideLayout);
    const cardsPerPage = isSidebar ? 1 : 2;
    const pageCount = Math.max(1, Math.ceil(trending.length / cardsPerPage));
    const visibleTrending = trending.slice(page * cardsPerPage, (page + 1) * cardsPerPage);

    if (!loading && trending.length === 0) return null;

    return (
        <div className="mb-5 w-full overflow-hidden">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 dark:bg-orange-500/20">
                        <TrendingUp size={15} />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Trending Now
                        <span className="ml-2 hidden font-medium text-slate-400 dark:text-slate-500 min-[380px]:inline">
                            Most popular this week
                        </span>
                    </h2>
                </div>
                <div className="flex gap-1.5">
                    <button
                        onClick={() => setPage((current) => Math.max(0, current - 1))}
                        disabled={page === 0}
                        aria-label="Scroll left"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                        disabled={page >= pageCount - 1}
                        aria-label="Scroll right"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className={`grid gap-2 pb-1 ${cardsPerPage === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                {loading ? (
                    Array.from({ length: cardsPerPage }).map((_, i) => (
                        <div
                            key={i}
                            className="h-[104px] w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                        />
                    ))
                ) : (
                    <AnimatePresence>
                        {visibleTrending.map((profile, i) => (
                            <motion.div
                                key={`${page}-${profile._id}`}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.35, delay: i * 0.07 }}
                                className="min-w-0"
                            >
                                <MiniTrendingCard profile={profile} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default FeedHero;
