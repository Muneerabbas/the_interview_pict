"use client";

import Navbar from "../../components/Navbar";
import FeedCard from "../../components/FeedCard";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Loader2, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import ProfileCardSkeleton from "../../components/ProfileCardSkeleton";
import { motion, AnimatePresence } from "framer-motion";

const LoadingScreen = () => (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-white/80 backdrop-blur-sm z-50">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
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
    const lastProfileElementRef = useCallback((node) => {
        if (pageLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMoreProfiles) {
                setPage((prevPage) => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [pageLoading, hasMoreProfiles]);

    const fetchProfiles = async (pageNumber, itemsPerPage) => {
        setPageLoading(true);
        try {
            const response = await axios.get(`/api/feed?page=${pageNumber}&itemsPerPage=${itemsPerPage}`);
            if (response.data && response.data.length > 0) {
                setProfiles((prev) => {
                    const uniqueProfiles = [
                        ...new Map(prev.concat(response.data).map((item) => [item._id, item])).values(),
                    ];
                    return uniqueProfiles;
                });
                if (response.data.length < itemsPerPage) {
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
        <main className="relative min-h-screen overflow-x-clip bg-gradient-to-b from-slate-50 via-blue-50/35 to-[#F0F2F5] font-sans pt-5 md:pt-20">
            <Navbar />
            {isShareButtonLoading && <LoadingScreen />}
            <div className="pointer-events-none absolute left-[-120px] top-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
            <div className="pointer-events-none absolute right-[-120px] top-[280px] h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />

            <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-16 sm:px-6">
                <section className="mb-8 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
                    <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.07)] backdrop-blur-sm sm:p-8">
                        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                            Real interview stories, straight from candidates
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                            Browse concise experiences, patterns, and tips from recent interviews. Scroll to discover what different roles and companies are actually asking.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-[0_10px_28px_rgba(37,99,235,0.35)]">
                        <h2 className="text-xl font-bold leading-tight">Share your interview experience</h2>
                        <p className="mt-3 text-sm leading-6 text-blue-100">
                            One honest story can save someone hours of guesswork and boost their confidence before the big day.
                        </p>
                        <Link href="/post" onClick={handleShareExperienceClick} prefetch={true} scroll={false}>
                            <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
                                <Send className="h-4 w-4" />
                                Post Your Story
                            </button>
                        </Link>
                    </div>
                </section>

                <div className="space-y-6">
                    {pageLoading && page === 0 && profiles.length === 0 ? (
                        skeletonCards.map((_, index) => <ProfileCardSkeleton key={index} />)
                    ) : (
                        <AnimatePresence>
                            {profiles.map((profile, index) => {
                                // Attach observer to the second-to-last item for smoother infinite scrolling
                                const shouldObserve = profiles.length === index + 2;
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: (index % 10) * 0.05 }}
                                        ref={shouldObserve ? lastProfileElementRef : null}
                                        key={profile._id}
                                    >
                                        <FeedCard profile={profile} width="w-full" />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                <div className="mt-12 flex flex-col items-center space-y-4 pb-4">
                    {pageLoading && page !== 0 && (
                        <div className="flex items-center space-x-3 rounded-full border border-indigo-100 bg-white px-6 py-3 text-indigo-600 shadow-sm">
                            <Loader2 className="animate-spin w-5 h-5" />
                            <span className="font-semibold text-sm">Loading more experiences...</span>
                        </div>
                    )}

                    {!pageLoading && !hasMoreProfiles && profiles.length > 0 && (
                        <div className="w-full flex items-center justify-center py-6">
                            <div className="h-[1px] bg-slate-200 flex-1"></div>
                            <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">You have reached the end</span>
                            <div className="h-[1px] bg-slate-200 flex-1"></div>
                        </div>
                    )}
                    {!pageLoading && !hasMoreProfiles && profiles.length === 0 && page === 0 && (
                        <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                            <p className="text-lg font-semibold text-slate-700">No experiences posted yet.</p>
                            <p className="mt-2 text-sm text-slate-500">Start the feed by sharing your own interview story.</p>
                            <Link href="/post" onClick={handleShareExperienceClick} prefetch={true} scroll={false}>
                                <button className="mt-5 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                                    Share the first story
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
