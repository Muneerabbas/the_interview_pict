"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import FeedCard from "./FeedCard";
import axios from "axios";

const FeedHero = ({ isDarkMode }) => {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await axios.get("/api/feed?sort=trending&itemsPerPage=6");
                setTrending(res.data);
            } catch (err) {
                console.error("Failed to fetch trending:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    if (!loading && trending.length === 0) return null;

    return (
        <div className="mb-10 w-full overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 dark:bg-orange-500/20">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 italic">Trending Now</h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Most popular stories this week</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/50 text-slate-600 backdrop-blur-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/50 text-slate-600 backdrop-blur-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex items-stretch gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="min-w-[300px] sm:min-w-[380px] h-[200px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    ))
                ) : (
                    <AnimatePresence>
                        {trending.map((profile, i) => (
                            <motion.div
                                key={profile._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="flex min-w-[300px] snap-start sm:min-w-[380px]"
                            >
                                <FeedCard profile={profile} width="w-full" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default FeedHero;
