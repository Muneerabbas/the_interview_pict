"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import Link from "next/link";

export default function CompaniesDirectoryClient({ companies = [], countsMap = {} }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeHydrated, setThemeHydrated] = useState(false);

  useEffect(() => {
    const storedCompaniesTheme = window.localStorage.getItem("companies-theme");
    const storedGlobalTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDarkMode = storedCompaniesTheme
      ? storedCompaniesTheme === "dark"
      : storedGlobalTheme
        ? storedGlobalTheme === "dark"
        : prefersDark;

    setIsDarkMode(initialDarkMode);
    setThemeHydrated(true);
  }, []);

  useEffect(() => {
    if (!themeHydrated) return;
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("companies-theme", isDarkMode ? "dark" : "light");
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode, themeHydrated]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fafcff] pb-20 pt-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode((prev) => !prev)} />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] top-[-10%] h-[50vh] w-[50vw] rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-500/15" />
        <div className="absolute -right-[10%] top-[20%] h-[60vh] w-[60vw] rounded-full bg-cyan-300/10 blur-[130px] dark:bg-cyan-500/12" />
        <div className="absolute bottom-[-10%] left-[20%] h-[50vh] w-[50vw] rounded-full bg-indigo-300/10 blur-[100px] dark:bg-indigo-500/12" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div className="relative z-10">
            <h1 className="flex items-center justify-center gap-3 pb-1 text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:justify-start sm:text-4xl">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
              </span>
              Company Directory
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] text-slate-600 dark:text-slate-300 sm:text-lg">
              Explore the companies where candidates have interviewed and prepare for your next opportunity.
            </p>
          </div>

          <Link
            href="/add-company"
            className="relative z-10 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-[14px] font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-blue-500/35 active:scale-95"
          >
            Add Company
          </Link>
        </div>

        {companies.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <Building2 size={40} className="mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No companies found</h3>
            <p className="mt-1 text-sm">Be the first to add a company to the directory.</p>
          </div>
        ) : (
          <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link
                href={`/companies/${company?.slug}`}
                key={company._id}
                className="group relative flex flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white/40 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-[0_14px_34px_rgba(2,6,23,0.6)] dark:hover:shadow-[0_18px_42px_rgba(8,145,178,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-cyan-950/20 dark:to-transparent" />

                <div className="relative z-10 mb-4 flex items-start gap-4">
                  {company.logo ? (
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[11px] border-[1.5px] border-slate-200/80 bg-white p-1 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-slate-700 dark:bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] border-[1.5px] border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 text-lg font-bold text-blue-600 shadow-inner transition-transform duration-300 group-hover:scale-105 dark:border-slate-700 dark:from-cyan-900/40 dark:to-blue-900/40 dark:text-cyan-300">
                      {(company?.name?.charAt(0) || "C").toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[17px] font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
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

                  <div className="relative z-10 flex items-center justify-between border-t border-slate-200/60 pt-4 dark:border-slate-700/80">
                    <div className={`text-[13px] font-bold transition-colors ${(countsMap[(company.name || "").toLowerCase()] || 0) > 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 opacity-50 dark:text-slate-500"
                      }`}>
                      {countsMap[(company.name || "").toLowerCase()] || 0} Interviews
                    </div>
                    <div className="flex items-center gap-1 text-[13px] font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                      View Details
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
