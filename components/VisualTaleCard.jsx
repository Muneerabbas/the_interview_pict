"use client";

import React, { memo } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { BookOpen, Clock, Heart, Eye, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";

// tech_hackathon_story image path from artifacts
const DEFAULT_VISUALS = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop"
];

const VisualTaleCard = memo(({ profile, disableLink = false, priority = false }) => {
    const { title, profileName, views, likes, image, profilePic } = profile;
    const isLiked = likes.length > 100;
    const readPath = `/single/${profile._id}`;
    const visualSrc = image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop";

    // Mouse tracking for interactive lighting
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            whileHover={{
                y: -15,
                scale: 1.05,
                borderRadius: "1.5rem"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="group relative h-[380px] w-full overflow-hidden rounded-[3rem] bg-slate-900 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-700 hover:border-cyan-400/50 hover:shadow-[0_40px_100px_rgba(34,211,238,0.2)]"
        >
            {/* Background Image with Zoom */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={visualSrc}
                    alt={title}
                    fill
                    priority={priority}
                    className="object-cover opacity-70 transition-all duration-1000 group-hover:scale-110 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity duration-700" />
            </div>

            {/* Interactive Inner Surface Glow (Godly Effect) */}
            <motion.div
                className="pointer-events-none absolute -inset-px z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            600px circle at ${mouseX}px ${mouseY}px,
                            rgba(34, 211, 238, 0.15),
                            transparent 80%
                        )
                    `,
                }}
            />

            {/* Content Container */}
            <div className="relative z-20 flex h-full flex-col justify-end p-10">
                {/* Modern Badge */}
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/40 px-5 py-2 text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 backdrop-blur-3xl shadow-xl transition-all duration-500 group-hover:bg-cyan-400 group-hover:text-slate-950 group-hover:border-transparent group-hover:translate-y-[-2px]">
                        <BookOpen size={12} strokeWidth={3} />
                        Insight Tale
                    </div>
                </div>

                {/* Title with Gradient Polish */}
                <h2 className="mb-8 text-3xl font-black leading-[1.05] tracking-tighter text-white line-clamp-2 transition-transform duration-700 group-hover:translate-x-2">
                    {title}
                </h2>

                {/* Bottom Bar: Glassmorphic Minimalist */}
                <div className="flex items-center justify-between border-t border-white/10 pt-8 mt-2">
                    <div className="flex items-center gap-5">
                        <div className="relative h-14 w-14 shrink-0 p-1 overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-xl transition-all duration-700 group-hover:border-cyan-400 group-hover:scale-110">
                            <div className="relative h-full w-full overflow-hidden rounded-full">
                                <Image
                                    src={profilePic || "/app_icon.png"}
                                    alt={profileName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-white leading-tight tracking-tight mb-1">{profileName}</span>
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Member</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-slate-400">
                        <div className="flex items-center gap-2.5">
                            <Eye size={20} className="transition-colors group-hover:text-cyan-400" />
                            <span className="text-[11px] font-black tracking-tighter">{views}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Heart size={20} className={isLiked ? "fill-red-500 text-red-500" : "transition-colors group-hover:text-red-500"} />
                            <span className="text-[11px] font-black tracking-tighter text-slate-500">{likes.length}</span>
                        </div>
                    </div>
                </div>

                {/* Invisible Navigation Overlay */}
                {!disableLink && (
                    <Link
                        href={readPath}
                        className="absolute inset-0 z-30"
                        aria-label={`Read story: ${title}`}
                    />
                )}

                {/* Floating Stylized Icon */}
                <div className="absolute top-10 right-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/20 backdrop-blur-2xl text-white opacity-0 scale-50 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:bg-white group-hover:text-slate-950">
                    <ArrowUpRight size={26} strokeWidth={3} />
                </div>
            </div>

            {/* Premium Edge Reflection */}
            <div className="absolute inset-0 z-40 opacity-0 transition-all duration-700 group-hover:opacity-100 ring-2 ring-inset ring-white/10 rounded-inherit pointer-events-none" />
        </motion.div>
    );
});

export default VisualTaleCard;
