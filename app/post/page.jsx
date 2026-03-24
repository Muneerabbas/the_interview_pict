"use client";

import React, { useEffect, useState } from 'react';
import MdxEditorPage from "../../components/ExpForm";
import Login from "../../components/Login";
import Navbar from "../../components/Navbar";
import { useSession } from 'next-auth/react';
import { Loader2, FileText } from "lucide-react";

export default function Post() {
  const { data: session, status } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeHydrated, setThemeHydrated] = useState(false);

  useEffect(() => {
    const storedPostTheme = window.localStorage.getItem("post-theme");
    const storedGlobalTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDarkMode = storedPostTheme
      ? storedPostTheme === "dark"
      : storedGlobalTheme
        ? storedGlobalTheme === "dark"
        : prefersDark;

    setIsDarkMode(initialDarkMode);
    setThemeHydrated(true);
  }, []);

  useEffect(() => {
    if (!themeHydrated) return;
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("post-theme", isDarkMode ? "dark" : "light");
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode, themeHydrated]);

  // Lock or unlock scroll when the login overlay is shown
  useEffect(() => {
    if (!session) {
      document.body.style.overflow = 'hidden'; // Lock scroll
    } else {
      document.body.style.overflow = ''; // Unlock scroll
    }

    // Clean up when the component is unmounted
    return () => {
      document.body.style.overflow = '';
    };
  }, [session]);

  if (status === "loading") {
    return (
      <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(45,212,191,0.14),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1120_55%,#111827_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute left-[-140px] top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
        <div className="pointer-events-none absolute right-[-120px] top-[320px] h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/20" />
        <div className="relative flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-white/85 px-6 py-4 text-blue-600 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-cyan-500/35 dark:bg-slate-900/85 dark:text-cyan-300 dark:shadow-[0_16px_42px_rgba(2,6,23,0.65)]">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-xl font-medium">Loading...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(45,212,191,0.14),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1120_55%,#111827_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute left-[-140px] top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
      <div className="pointer-events-none absolute right-[-120px] top-[320px] h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/20" />

      {!session && (
        <Navbar
          showThemeToggle
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        />
      )}
      <div className="relative min-h-screen">
        {!session ? (
          // Displaying the login overlay and banner when the user is not logged in
          <div className="relative min-h-screen pt-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white/85 px-6 py-12 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/85 dark:shadow-[0_16px_44px_rgba(2,6,23,0.65)] sm:px-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <FileText size={48} className="text-blue-600 dark:text-cyan-300" />
                  <h1 className="text-3xl font-bold text-[#1D1D1D] dark:text-slate-100">Share Your Experience</h1>
                  <p className="text-lg text-[#1D1D1D] dark:text-slate-300 max-w-2xl">
                      Help others by sharing your interview experiences and insights
                  </p>
                </div>
              </div>
            </div>

            {/* Login Overlay */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm dark:bg-black/50" />
              <div className="relative max-w-md w-full mx-4 rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_20px_48px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-[0_22px_52px_rgba(2,6,23,0.75)]">
                <Login />
              </div>
            </div>
          </div>
        ) : (
          // Content when the user is logged in
          <div className="relative min-h-screen">
            <MdxEditorPage
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
              showThemeToggle
            />
            <div className="pb-[400px] sm:pb-[110px] md:pb-[300px]"></div>
          </div>
        )}
      </div>
    </main>
  );
}
