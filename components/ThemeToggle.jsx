"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function cn(...parts) {
    return parts.filter(Boolean).join(" ");
}

export default function ThemeToggle({ className = "" }) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    if (!mounted) return <div className={cn("h-9 w-9 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800", className)} />;

    const options = [
        { id: "light", label: "Light", icon: Sun, color: "text-amber-500" },
        { id: "dark", label: "Dark", icon: Moon, color: "text-indigo-400" },
        { id: "system", label: "System", icon: Monitor, color: "text-slate-500 dark:text-slate-400" },
    ];

    const currentOption = options.find((o) => o.id === theme) || options[2];
    const DisplayIcon = resolvedTheme === "dark" ? Moon : Sun;

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle theme menu"
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-md transition-all hover:-translate-y-[0.5px] hover:border-blue-300/50 hover:bg-white active:scale-95 dark:border-slate-700/80 dark:bg-slate-900/80 dark:hover:border-cyan-500/40 dark:hover:bg-slate-900"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme === "system" ? "system" : resolvedTheme}
                        initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {theme === "system" ? (
                            <Monitor size={16} className="text-slate-500 dark:text-slate-400" />
                        ) : resolvedTheme === "dark" ? (
                            <Moon size={16} className="text-blue-400" />
                        ) : (
                            <Sun size={16} className="text-amber-500" />
                        )}
                    </motion.div>
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full z-[60] mt-2 min-w-[130px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.15)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/95 dark:shadow-[0_12px_44px_rgba(2,6,23,0.7)]"
                    >
                        <div className="mb-1 pointer-events-none px-2.5 py-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Theme</span>
                        </div>
                        {options.map((option) => {
                            const Icon = option.icon;
                            const isActive = theme === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        setTheme(option.id);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-all",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 dark:bg-cyan-950/40 dark:text-cyan-300"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon size={14} className={cn(isActive ? "" : "opacity-70", isActive && option.color)} />
                                        {option.label}
                                    </div>
                                    {isActive && <Check size={12} className="text-blue-600 dark:text-cyan-400" />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
