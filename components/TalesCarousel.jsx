"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { resolveProfileName } from "@/lib/utils";

const TalesCarousel = ({ tales = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % tales.length);
    }, [tales.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + tales.length) % tales.length);
    }, [tales.length]);

    useEffect(() => {
        if (!isAutoPlaying || tales.length <= 1) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide, tales.length]);

    if (!tales || tales.length === 0) return null;

    const currentTale = tales[currentIndex];
    const profileName = resolveProfileName(currentTale);

    return (
        <div
            className="group relative h-[500px] w-full overflow-hidden rounded-[3rem] bg-slate-950 shadow-2xl md:h-[600px]"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    {/* Main Visual */}
                    <Image
                        src={currentTale.image || "/api/placeholder/1200/800"}
                        alt={currentTale.title}
                        fill
                        priority
                        className="object-cover opacity-60 transition-transform duration-10000 linear group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content Overlay */}
            <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-20 lg:w-2/3">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={`content-${currentIndex}`}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="mb-6 flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-[12px] font-black uppercase tracking-widest text-blue-400 backdrop-blur-xl">
                            <Sparkles size={14} className="text-blue-400" />
                            Featured Tale
                        </span>
                        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                            Story #{currentIndex + 1}
                        </span>
                    </div>

                    <h1 className="mb-8 text-5xl font-black leading-[1.1] tracking-tighter text-white md:text-7xl">
                        {currentTale.title}
                    </h1>

                    <div className="mb-10 flex flex-wrap items-center gap-8 border-l-4 border-blue-500 pl-8 transition-all hover:border-blue-400">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Author</span>
                            <span className="text-lg font-bold text-white">{profileName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Reads</span>
                            <span className="text-lg font-bold text-white">{currentTale.views || 0}</span>
                        </div>
                    </div>

                    <Link
                        href={`/single/${currentTale.uid || currentTale._id}`}
                        className="inline-flex items-center gap-4 rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-900 transition-all hover:scale-105 hover:bg-blue-50 hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                    >
                        Read Story
                        <BookOpen size={18} />
                    </Link>
                </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-12 right-12 flex items-center gap-4">
                <button
                    onClick={prevSlide}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-2xl transition-all hover:bg-white hover:text-slate-900"
                    aria-label="Previous story"
                >
                    <ChevronLeft size={28} />
                </button>
                <button
                    onClick={nextSlide}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-2xl transition-all hover:bg-white hover:text-slate-900"
                    aria-label="Next story"
                >
                    <ChevronRight size={28} />
                </button>
            </div>

            {/* Progress Dots */}
            <div className="absolute left-1/2 bottom-12 flex -translate-x-1/2 gap-3 md:left-20 md:translate-x-0">
                {tales.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === idx ? "w-10 bg-blue-500" : "w-2 bg-white/20 hover:bg-white/40"}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default TalesCarousel;
