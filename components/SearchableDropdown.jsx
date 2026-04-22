"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder = "Select option",
    error = false,
    addActionLabel,
    onAddActionClick,
    remoteSearch = false,
    loading = false,
    hasMore = false,
    onSearchTermChange,
    onLoadMore,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const normalizeOption = (opt) => typeof opt === 'object' ? opt : { label: opt === "others" ? "Others..." : String(opt), value: String(opt) };
    const normalizedOptions = useMemo(() => options.map(normalizeOption), [options]);

    useEffect(() => {
        if (!remoteSearch || !onSearchTermChange) return;

        const timeoutId = window.setTimeout(() => {
            onSearchTermChange(searchTerm);
        }, 250);

        return () => window.clearTimeout(timeoutId);
    }, [remoteSearch, onSearchTermChange, searchTerm]);

    const filteredOptions = useMemo(() => {
        if (remoteSearch) return normalizedOptions;
        if (!searchTerm) return normalizedOptions;
        return normalizedOptions.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [normalizedOptions, remoteSearch, searchTerm]);

    const currentLabel = useMemo(() => {
        const selected = normalizedOptions.find(opt => opt.value === String(value));
        return selected ? selected.label : value;
    }, [normalizedOptions, value]);

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleScroll = (event) => {
        if (!remoteSearch || !onLoadMore || loading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 32) {
            onLoadMore();
        }
    };

    return (
        <div className={`relative w-full ${isOpen ? 'z-[320]' : 'z-20'}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`group w-full flex items-center justify-between rounded-xl border bg-slate-50/50 px-3 py-2.5 text-left text-[13px] font-semibold text-slate-700 shadow-inner transition-all sm:px-4 sm:py-3 sm:text-sm ${error ? "border-red-300 ring-2 ring-red-500/10" : "border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20"
                    } dark:text-slate-200 cursor-pointer`}
            >
                <span title={currentLabel || placeholder} className={`relative block min-w-0 flex-1 truncate pr-3 text-[13px] sm:text-sm ${!value ? 'font-medium text-slate-500 dark:text-slate-300' : 'text-slate-700 dark:text-slate-200'}`}>
                    {currentLabel || placeholder}
                    {value && currentLabel ? (
                        <span className="pointer-events-none absolute left-0 top-full z-[380] mt-2 hidden max-w-[28rem] whitespace-normal rounded-lg bg-slate-950 px-3 py-2 text-left text-xs font-medium text-white shadow-xl group-hover:block dark:bg-slate-100 dark:text-slate-950">
                            {currentLabel}
                        </span>
                    ) : null}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 z-[360] mt-2 w-full max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95"
                    >
                        <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg bg-slate-50 px-9 py-2 text-[13px] font-medium text-slate-700 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-950 dark:focus:ring-cyan-500/20 sm:text-sm"
                            />
                        </div>

                        <ul
                            ref={listRef}
                            onScroll={handleScroll}
                            className="max-h-56 overflow-y-auto p-1"
                        >
                            {filteredOptions.length === 0 ? (
                                <li className="px-3 py-3 text-center text-[13px] font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                                    {loading ? "Loading..." : "No results found."}
                                </li>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected = String(value) === option.value;
                                    return (
                                        <li
                                            key={option.value}
                                            className={`relative flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors sm:text-sm ${isSelected
                                                ? "bg-blue-50 text-blue-700 dark:bg-cyan-950/40 dark:text-cyan-300"
                                                : "text-slate-700 hover:bg-blue-100 hover:text-blue-900 dark:text-slate-200 dark:hover:bg-cyan-900/35 dark:hover:text-cyan-100"
                                                }`}
                                            onClick={() => handleSelect(option)}
                                            title={option.label}
                                        >
                                            <span className="block flex-1 truncate pr-2 leading-snug">{option.label}</span>
                                            {isSelected && <Check className="h-4 w-4 shrink-0" />}
                                        </li>
                                    );
                                })
                            )}
                            {loading && filteredOptions.length > 0 && (
                                <li className="flex items-center justify-center gap-2 px-3 py-3 text-[13px] font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading...
                                </li>
                            )}
                            {!loading && remoteSearch && hasMore && (
                                <li className="px-3 py-2 text-center text-[12px] font-medium text-slate-400 dark:text-slate-500 sm:text-sm">
                                    Scroll for more
                                </li>
                            )}
                        </ul>
                        {addActionLabel && (
                            <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                                <button
                                    type="button"
                                    className="w-full rounded-lg bg-blue-50 py-2 text-center text-[13px] font-bold text-blue-600 hover:bg-blue-100 transition-colors dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (onAddActionClick) onAddActionClick(searchTerm);
                                        setIsOpen(false);
                                    }}
                                >
                                    + {addActionLabel}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
