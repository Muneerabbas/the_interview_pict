"use client";

import React, { useEffect } from 'react';
import MdxEditorPage from "../../components/ExpForm";
import Login from "../../components/Login";
import { useSession } from 'next-auth/react';
import { Loader2 } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2 text-blue-500">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* MdxEditor is always rendered */}
      <div className={`w-full ${!session ? 'filter blur-sm' : ''}`}>
        <MdxEditorPage />
      </div>

      {/* Login overlay when not authenticated */}
      {!session && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/5 backdrop-blur-sm" />
          <div className="relative bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl" />
            <div className="relative">
              <Login />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
