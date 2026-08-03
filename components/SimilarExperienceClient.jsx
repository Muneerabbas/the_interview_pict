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
        <section className="relative mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="relative mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                        <Layers3 size={22} className="text-blue-600 dark:text-blue-400" />
                        Related Experiences
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Hand-picked interview stories similar to this one.
                    </p>
                </div>
                <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    {articles.length} posts
                </span>
            </div>

            <div className="relative group/scroll">
                {/* Navigation Arrows */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-4 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white sm:flex"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={18} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-4 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white sm:flex"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={18} />
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
