"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchableDropdown({
    options = [],
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
        if (!isOpen) return undefined;

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    const normalizeOption = (opt) => typeof opt === 'object' ? opt : { label: opt === "others" ? "Others..." : String(opt), value: String(opt) };
    const normalizedOptions = useMemo(
        () => (Array.isArray(options) ? options : []).map(normalizeOption),
        [options]
    );

    const skipInitialSearch = useRef(true);
    useEffect(() => {
        if (!remoteSearch || !onSearchTermChange) return undefined;
        if (skipInitialSearch.current) {
            skipInitialSearch.current = false;
            return undefined;
        }

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
        if (selected) return selected.label;
        // Fall back to the same label mapping instead of dumping the raw value
        // (which rendered a literal "others" after picking "Others...").
        return value ? normalizeOption(value).label : value;
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
                className={`group w-full flex items-center justify-between rounded-xl border bg-slate-50/50 px-3 py-2.5 text-left text-[13px] font-semibold text-slate-700 shadow-inner transition-all sm:px-4 sm:py-3 sm:text-sm dark:bg-slate-800/80 ${error ? "border-red-400 ring-2 ring-red-500/10 dark:border-red-500/70" : "border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-500/10 dark:border-slate-700 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
                    } dark:text-slate-200 cursor-pointer`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span title={currentLabel || placeholder} className={`relative block min-w-0 flex-1 truncate pr-3 text-[13px] sm:text-sm ${!value ? 'font-medium text-slate-500 dark:text-slate-300' : 'text-slate-700 dark:text-slate-200'}`}>
                    {currentLabel || placeholder}
                    {value && currentLabel ? (
                        <span className="pointer-events-none absolute left-0 top-full z-[380] mt-2 hidden max-w-[28rem] whitespace-normal rounded-lg bg-slate-950 px-3 py-2 text-left text-xs font-medium text-white shadow-xl group-hover:block dark:bg-slate-100 dark:text-slate-950">
                            {currentLabel}
                        </span>
                    ) : null}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
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
                                className="w-full rounded-lg bg-slate-50 px-9 py-2 text-[13px] font-medium text-slate-700 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-950 dark:focus:ring-blue-500/20 sm:text-sm"
                            />
                        </div>

                        <ul
                            ref={listRef}
                            role="listbox"
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
                                            role="option"
                                            aria-selected={isSelected}
                                            tabIndex={0}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    handleSelect(option);
                                                }
                                            }}
                                            className={`relative flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-sm ${isSelected
                                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                                : "text-slate-700 hover:bg-blue-100 hover:text-blue-900 dark:text-slate-200 dark:hover:bg-blue-900/35 dark:hover:text-blue-100"
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
                                    className="w-full rounded-lg bg-blue-50 py-2 text-center text-[13px] font-bold text-blue-600 hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
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
