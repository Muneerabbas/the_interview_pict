"use client";

import React, { useEffect } from 'react';
import MdxEditorPage from "../../components/ExpForm";
import Login from "../../components/Login";
import Navbar from "../../components/Navbar";
import { useSession } from 'next-auth/react';
import { Loader2, FileText } from "lucide-react";

export default function Post() {
  const { data: session, status } = useSession();

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
      <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)]" />
        <div className="pointer-events-none absolute left-[-140px] top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-120px] top-[320px] h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="relative flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-white/85 px-6 py-4 text-blue-600 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-xl font-medium">Loading...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)]" />
      <div className="pointer-events-none absolute left-[-140px] top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[320px] h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />

      {!session && <Navbar />}
      <div className="relative min-h-screen">
        {!session ? (
          // Displaying the login overlay and banner when the user is not logged in
          <div className="relative min-h-screen pt-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white/85 px-6 py-12 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:px-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <FileText size={48} className="text-blue-600" />
                  <h1 className="text-3xl font-bold text-[#1D1D1D]">Share Your Experience</h1>
                  <p className="text-lg text-[#1D1D1D] max-w-2xl">
                      Help others by sharing your interview experiences and insights
                  </p>
                </div>
              </div>
            </div>

            {/* Login Overlay */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
              <div className="relative max-w-md w-full mx-4 rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_20px_48px_rgba(15,23,42,0.18)]">
                <Login />
              </div>
            </div>
          </div>
        ) : (
          // Content when the user is logged in
          <div className="relative min-h-screen">
            <MdxEditorPage />
            <div className="pb-[400px] sm:pb-[110px] md:pb-[300px]"></div>
          </div>
        )}
      </div>
    </main>
  );
}
