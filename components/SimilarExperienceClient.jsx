"use client";
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Layers3 } from "lucide-react";
import ArticleCard from "./ArticleCard";

export default function SimilarExperienceClient({ articles }) {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (!articles || articles.length === 0) return null;

    return (
        <section className="relative mt-12 overflow-hidden rounded-[2.5rem] border border-slate-300/75 bg-white/88 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-slate-700/70 dark:bg-[#0f172a]/55 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-10">
            <div className="pointer-events-none absolute -left-20 -top-16 h-64 w-64 rounded-full bg-blue-400/10 blur-[100px] dark:bg-cyan-500/10" />
            <div className="pointer-events-none absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-indigo-400/10 blur-[100px] dark:bg-blue-600/10" />

            <div className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-slate-100 dark:sm:border-slate-800/50 sm:pb-6">
                <div>
                    <h2 className="inline-flex items-center gap-2.5 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                        <Layers3 size={26} className="text-blue-600 dark:text-cyan-400" />
                        Related Experiences
                    </h2>
                    <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Hand-picked interview stories similar to this one.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/75 dark:text-slate-300">
                        {articles.length} posts
                    </span>
                </div>
            </div>

            <div className="relative group/scroll">
                {/* Navigation Arrows */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300/90 bg-white/95 text-slate-700 shadow-[0_14px_28px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-all hover:scale-105 hover:border-blue-300 hover:text-blue-700 group-hover/scroll:opacity-100 dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:border-cyan-500/55 dark:hover:text-cyan-300 sm:-left-6 opacity-0 sm:opacity-100"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={22} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300/90 bg-white/95 text-slate-700 shadow-[0_14px_28px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-all hover:scale-105 hover:border-blue-300 hover:text-blue-700 group-hover/scroll:opacity-100 dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:border-cyan-500/55 dark:hover:text-cyan-300 sm:-right-6 opacity-0 sm:opacity-100"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={22} strokeWidth={2.5} />
                </button>

                <div
                    ref={scrollRef}
                    className="relative -mx-2 flex gap-6 overflow-x-auto px-2 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
                        maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                    }}
                >
                    {articles.map((article) => (
                        <div key={article.uid} className="w-[290px] shrink-0 transition-transform duration-300 hover:scale-[1.02]">
                            <ArticleCard article={article} />
                        </div>
                    ))}
                    <div className="w-10 shrink-0" />
                </div>
            </div>
        </section>
    );
}
