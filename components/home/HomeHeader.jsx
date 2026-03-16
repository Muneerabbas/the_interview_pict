"use client";

import Link from "next/link";
import { DoorOpen, Menu } from "lucide-react";
import AdaptiveAvatar from "./AdaptiveAvatar";

export default function HomeHeader({ isAuthenticated, profileImage }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-8">
          <div className="flex items-center gap-2 text-primary">
            <DoorOpen className="text-3xl font-bold" />
            <h2 className="text-xl font-black uppercase italic tracking-tight text-white">The Interview Room</h2>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-10 md:flex">
            <Link className="text-sm font-bold text-primary transition-colors" href="/">Home</Link>
            <Link className="text-sm font-semibold text-slate-400 transition-colors hover:text-primary" href="/feed">Feed</Link>
            <Link className="text-sm font-semibold text-slate-400 transition-colors hover:text-primary" href="/about">Stories</Link>
            <Link className="text-sm font-semibold text-slate-400 transition-colors hover:text-primary" href="/search">Search</Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href={isAuthenticated ? "/post" : "/login"}
                className="h-11 rounded-full bg-primary px-6 text-sm font-bold text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
              >
                <span className="inline-flex h-full items-center">Sign Up</span>
              </Link>
              <Link
                href={isAuthenticated ? "/profile" : "/login"}
                className="h-11 rounded-full border border-slate-700 px-6 text-sm font-bold text-white hover:bg-slate-800"
              >
                <span className="inline-flex h-full items-center">Login</span>
              </Link>
            </div>
            <div className="size-10 overflow-hidden rounded-full border border-slate-700 bg-slate-800 p-0.5">
              <AdaptiveAvatar
                src={profileImage}
                alt="User profile"
                fallbackText="User"
                className="h-full w-full rounded-full object-cover text-xs"
                fallbackClassName="bg-gradient-to-br from-slate-500 to-slate-700"
              />
            </div>
            <button className="rounded-lg p-2 text-slate-200 md:hidden" aria-label="Open menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
