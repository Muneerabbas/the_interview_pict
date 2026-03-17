"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Mail, PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Login from "@/components/Login";
import ProfileCard from "@/components/Card";
import ProfileAvatar from "@/components/ProfileAvatar";

const LoadingScreen = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
    <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-6 py-4 text-slate-100">
      <Loader2 className="animate-spin text-primary" size={22} />
      <span className="font-semibold">Loading...</span>
    </div>
  </div>
);

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);

  const profilePic = session?.user?.image;
  const name = session?.user?.name || "Anonymous User";
  const email = session?.user?.email || "";

  useEffect(() => {
    if (status === "loading" || !session) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [status, session]);

  useEffect(() => {
    if (!email) return;

    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [email]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-lg font-semibold">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Navbar />
      {globalLoading && <LoadingScreen />}

      <section className="relative overflow-hidden border-b border-slate-200/70 bg-slate-100/80 py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,127,242,0.14),transparent_48%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 text-center md:flex-row md:text-left">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-slate-800">
            <ProfileAvatar src={profilePic} alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{name}</h1>
            {email && (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                <Mail size={15} className="text-primary" />
                <span>{email}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {!session ? (
        <section className="relative">
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80" />
            <div className="relative mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <Login />
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-5xl px-4 py-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Your Experiences</h2>
            <Link
              href="/post"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition-colors hover:bg-primary/90"
            >
              <PlusCircle size={16} />
              <span>Share Experience</span>
            </Link>
          </div>

          {loadingPosts ? (
            <div className="flex items-center justify-center py-10 text-primary">
              <Loader2 className="animate-spin" size={22} />
              <span className="ml-2 font-medium">Loading experiences...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-6 text-slate-600 dark:text-slate-300">No experiences shared yet.</p>
              <Link
                href="/post"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition-colors hover:bg-primary/90"
              >
                <PlusCircle size={16} />
                <span>Share Your First Experience</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <div key={post.uid} className="rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                  <ProfileCard
                    profile={post}
                    edit={true}
                    deletePost={true}
                    setGlobalLoading={setGlobalLoading}
                    disableCardClick={true}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
