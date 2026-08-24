"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { ArrowRight, Building2, ChevronLeft, ChevronRight, MapPin, Search, X } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 9;

export default function CompaniesDirectoryClient({ companies = [], countsMap = {} }) {
  const [hasInterviewsOnly, setHasInterviewsOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = (c.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesInterviews = hasInterviewsOnly ? (countsMap[(c.name || "").toLowerCase()] || 0) > 0 : true;
    return matchesSearch && matchesInterviews;
  });

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, hasInterviewsOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const pagedCompanies = filteredCompanies
    .filter((company) => company?.slug)
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Build page number list with ellipsis
  function getPageNumbers(total, current) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, current]);
    if (current > 1) pages.add(current - 1);
    if (current < total) pages.add(current + 1);
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    let prev = null;
    for (const p of sorted) {
      if (prev !== null && p - prev > 1) result.push("...");
      result.push(p);
      prev = p;
    }
    return result;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 pb-20 pt-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div className="relative z-10">
            <h1 className="flex items-center justify-center gap-3 pb-1 text-[26px] font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:justify-start sm:text-3xl">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
                <Building2 className="text-blue-600 dark:text-blue-400" size={22} />
              </span>
              Company Directory
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] text-slate-500 dark:text-slate-400">
              Explore the companies where candidates have interviewed and prepare for your next opportunity.
            </p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-10 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-blue-900/40 dark:focus:ring-blue-900/10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Has Interviews Filter */}
              <button
                onClick={() => setHasInterviewsOnly(!hasInterviewsOnly)}
                className={`group flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap ${hasInterviewsOnly
                  ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-900/40"
                  }`}
              >
                <div className={`h-2 w-2 rounded-full transition-colors ${hasInterviewsOnly ? "bg-white animate-pulse" : "bg-slate-300 dark:bg-slate-600"}`} />
                Has Interviews
                {hasInterviewsOnly && (
                  <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                    {filteredCompanies.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <Link
            href="/add-company"
            className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            Add Company
          </Link>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <Building2 size={40} className="mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No companies found</h3>
            <p className="mt-1 text-sm">
              {hasInterviewsOnly || searchQuery
                ? "No companies match your search or filters."
                : "Be the first to add a company to the directory."}
            </p>
            {(hasInterviewsOnly || searchQuery) && (
              <button
                onClick={() => {
                  setHasInterviewsOnly(false);
                  setSearchQuery("");
                }}
                className="mt-4 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pagedCompanies.map((company) => (
                <Link
                  href={`/companies/${company.slug}`}
                  key={company._id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:p-6"
                >
                  <div className="relative z-10 mb-4 flex items-start gap-4">
                    <div className="relative shrink-0 mt-0.5">
                      {company.logo ? (
                        <div className="relative z-10 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-blue-50 text-xl font-bold text-blue-600 dark:border-slate-800 dark:bg-blue-950/40 dark:text-blue-400">
                          {(company?.name?.charAt(0) || "C").toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[16px] font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                        {company.name}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {company.location && (
                          <span className="flex items-center gap-1 line-clamp-1">
                            <MapPin size={12} className="shrink-0" /> {company.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mb-5 flex-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300" style={{ lineHeight: '1.6' }}>
                    {company.about}
                  </p>

                  <div className="mt-auto">
                    {company.tags && company.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {company.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="ui-tag ui-tag-role text-[11px] px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                        {company.tags.length > 3 && (
                          <span className="ui-tag ui-tag-role text-[11px] px-2 py-0.5">
                            +{company.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="relative z-10 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div className={`text-[13px] font-semibold transition-colors ${(countsMap[(company.name || "").toLowerCase()] || 0) > 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 dark:text-slate-500"
                        }`}>
                        {countsMap[(company.name || "").toLowerCase()] || 0} Interviews
                      </div>
                      <div className="flex items-center gap-1 text-[13px] font-semibold text-slate-700 transition-colors group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400">
                        View Details
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1.5">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                {getPageNumbers(totalPages, currentPage).map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="flex h-9 w-9 items-center justify-center text-sm text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-all ${
                        currentPage === item
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Page info */}
            <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredCompanies.length)} of {filteredCompanies.length} companies
            </p>
          </>
        )}
      </div>
    </div>
  );
}
