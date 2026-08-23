"use client";

import { Heart } from "lucide-react";
import { useLike } from "@/hooks/use-like";

export default function LikeButton({ id, initialLikes = [], className = "" }) {
    // No refetch-on-mount effect here: it depended on `initialLikes`, an array
    // literal prop whose identity changed on every parent render, which turned
    // into a request storm on the post page.
    const { count, isLiked, pending, toggleLike } = useLike(id, initialLikes);

    return (
        <button
            type="button"
            onClick={toggleLike}
            disabled={pending}
            aria-pressed={isLiked}
            aria-label={isLiked ? "Unlike this post" : "Like this post"}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-all duration-200 disabled:opacity-70 ${isLiked
                ? "border-pink-200 bg-pink-50 text-pink-600 shadow-sm dark:border-pink-500/40 dark:bg-pink-950/35 dark:text-pink-300"
                : "border-slate-200 bg-white text-slate-600 hover:border-pink-200 hover:bg-pink-50/50 hover:text-pink-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-pink-500/40 dark:hover:bg-pink-950/35 dark:hover:text-pink-300"
                } ${className}`}
        >
            <Heart
                size={16}
                className={`transition-transform duration-200 ${isLiked ? "scale-110 fill-pink-500" : "group-hover:scale-110"}`}
            />
            <span>{count}</span>
        </button>
    );
}
