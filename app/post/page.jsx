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
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="flex items-center space-x-2 text-[#1877F2]">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-xl font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F0F2F5]">
        {!session ? (
          // Displaying the login overlay and banner when the user is not logged in
          <div className="relative h-screen">
            <div className="relative h-96 bg-gradient-to-r from-[#1877F2]/10 to-[#8B77F9]/10">
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-5xl mx-auto px-4 py-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <FileText size={48} className="text-[#1877F2]" />
                    <h1 className="text-3xl font-bold text-[#1D1D1D]">Share Your Experience</h1>
                    <p className="text-lg text-[#1D1D1D] max-w-2xl">
                      Help others by sharing your interview experiences and insights
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Overlay */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-[#F0F2F5]/80 backdrop-blur-sm" />
              <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
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
