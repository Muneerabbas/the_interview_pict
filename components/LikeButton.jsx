"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { useAuthModal } from "@/components/AuthModalProvider";

export default function LikeButton({ id, initialLikes = [], className = "" }) {
    const { data: session } = useSession();
    const userEmail = session?.user?.email;
    const { openAuthModal } = useAuthModal();

    const [likes, setLikes] = useState(Array.isArray(initialLikes) ? initialLikes : []);
    const isLiked = userEmail && Array.isArray(likes) && likes.includes(userEmail);

    useEffect(() => {
        setLikes(initialLikes);

        const fetchLatest = async () => {
            try {
                const res = await fetch(`/api/exp?uid=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.likes) setLikes(data.likes);
                }
            } catch (err) {
                console.error("Failed to sync likes:", err);
            }
        };
        fetchLatest();
    }, [initialLikes, id]);

    const handleLike = async () => {
        if (!session) {
            openAuthModal();
            return;
        }

        const newLikes = isLiked
            ? likes.filter((email) => email !== userEmail)
            : [...likes, userEmail];

        setLikes(newLikes);

        try {
            const res = await fetch("/api/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, email: userEmail }),
            });
            if (!res.ok) throw new Error("Failed to like");
        } catch (err) {
            console.error(err);

            setLikes(likes);
        }
    };

    return (
        <button
            onClick={handleLike}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-all duration-200 ${isLiked
                ? "border-pink-200 bg-pink-50 text-pink-600 shadow-sm dark:border-pink-500/40 dark:bg-pink-950/35 dark:text-pink-300"
                : "border-slate-200 bg-white text-slate-600 hover:border-pink-200 hover:bg-pink-50/50 hover:text-pink-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-pink-500/40 dark:hover:bg-pink-950/35 dark:hover:text-pink-300"
                } ${className}`}
        >
            <Heart
                size={16}
                className={`transition-transform duration-200 ${isLiked ? "scale-110 fill-pink-500" : "group-hover:scale-110"}`}
            />
            <span>{likes.length}</span>
        </button>
    );
}
