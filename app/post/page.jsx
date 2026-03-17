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
      <div className="min-h-screen flex items-center justify-center bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
        <div className="flex items-center space-x-2 text-primary">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-xl font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
        {!session ? (
          // Displaying the login overlay and banner when the user is not logged in
          <div className="relative h-screen">
            <div className="relative h-96 bg-gradient-to-r from-primary/10 to-sky-500/10">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-5xl mx-auto px-4 py-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <FileText size={48} className="text-primary" />
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Share Your Experience</h1>
                    <p className="text-lg text-slate-700 dark:text-slate-200 max-w-2xl">
                      Help others by sharing your interview experiences and insights
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Overlay */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80" />
              <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl p-8 max-w-md w-full mx-4 dark:bg-slate-900 dark:border-slate-800">
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
    </>
  );
}
