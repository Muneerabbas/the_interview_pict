"use client";

import React, { useEffect, useState, Suspense } from 'react';
import MdxEditorPage from "../../components/ExpForm";
import Login from "../../components/Login";
import Navbar from "../../components/Navbar";
import { useSession } from 'next-auth/react';
import { useSearchParams } from "next/navigation";
import { Loader2, FileText, BookOpen, Briefcase } from "lucide-react";
import { TALES_ENABLED } from "@/lib/feature-flags";

function PostContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [contentType, setContentType] = useState("interview");
  const isStory = contentType === "tale";

  useEffect(() => {
    const requestedType = searchParams.get("type");
    // ?type=tale must not open the story editor while Tales is hidden.
    setContentType(requestedType === "tale" && TALES_ENABLED ? "tale" : "interview");
  }, [searchParams]);

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
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 text-blue-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-blue-300">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-xl font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {!session ? (
        // Displaying the login overlay and banner when the user is not logged in
        <div className="relative min-h-screen pt-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-10">
              <div className="flex flex-col items-center text-center space-y-4">
                <FileText size={48} className="text-blue-600 dark:text-blue-300" />
                <h1 className="text-3xl font-bold text-[#1D1D1D] dark:text-slate-100">
                  {isStory ? "Share Your Story" : "Share Your Experience"}
                </h1>
                <p className="text-lg text-[#1D1D1D] dark:text-slate-300 max-w-2xl">
                  {isStory
                    ? "Share your stories from hackathons, general events, projects, and experiences worth sharing."
                    : "Help others by sharing your interview experiences and insights"}
                </p>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setContentType("interview")}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${contentType === "interview"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400"
                      }`}
                  >
                    <Briefcase size={16} />
                    Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => TALES_ENABLED && setContentType("tale")}
                    disabled={!TALES_ENABLED}
                    title={TALES_ENABLED ? undefined : "Stories are coming soon"}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${contentType === "tale"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                      : "text-slate-500 dark:text-slate-400"
                      } ${TALES_ENABLED ? "" : "cursor-not-allowed opacity-60"}`}
                  >
                    <BookOpen size={16} />
                    Story
                    {!TALES_ENABLED && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        Soon
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Login Overlay */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm dark:bg-black/50" />
            <div className="relative max-w-md w-full mx-4 rounded-xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_20px_48px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-[0_22px_52px_rgba(2,6,23,0.75)]">
              <Login />
            </div>
          </div>
        </div>
      ) : (
        // Content when the user is logged in
        <div className="relative min-h-screen">
          <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 sm:px-6">
            <div className="mb-5 flex justify-center">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setContentType("interview")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${contentType === "interview"
                    ? "bg-slate-900 text-white dark:bg-blue-400 dark:text-slate-950"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    }`}
                >
                  <Briefcase size={16} />
                  Interview
                </button>
                <button
                  type="button"
                  onClick={() => TALES_ENABLED && setContentType("tale")}
                  disabled={!TALES_ENABLED}
                  title={TALES_ENABLED ? undefined : "Stories are coming soon"}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${contentType === "tale"
                    ? "bg-slate-900 text-white dark:bg-blue-400 dark:text-slate-950"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    } ${TALES_ENABLED ? "" : "cursor-not-allowed opacity-60"}`}
                >
                  <BookOpen size={16} />
                  Story
                  {!TALES_ENABLED && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      Soon
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          <MdxEditorPage showThemeToggle contentType={contentType} />
          <div className="pb-8 sm:pb-10 md:pb-12"></div>
        </div>
      )}
    </div>
  );
}

export default function Post() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-slate-50 dark:bg-slate-950">
      {/* Always mounted: hiding it once a session existed left signed-in authors
          with no navigation, and made it flash away after the session resolved. */}
      <Navbar />

      <Suspense fallback={
        <div className="relative flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 text-blue-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-blue-300">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-xl font-medium">Initializing editor...</span>
          </div>
        </div>
      }>
        <PostContent />
      </Suspense>
    </main>
  );
}
