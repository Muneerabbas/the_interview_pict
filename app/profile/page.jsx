"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Mail, PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Login from '../../components/Login';
import ProfileCard from '../../components/Card';
import ProfileAvatar from '../../components/ProfileAvatar';

const LoadingScreen = () => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-6 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.2)]">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <span className="text-sm font-semibold text-slate-700">Processing...</span>
    </div>
  </div>
);

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const profile_pic = session?.user?.image;
  const name = session?.user?.name || "John Doe";
  const email = session?.user?.email || "john.doe@example.com";
  const [globalLoading, setGlobalLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading' || !session) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [status, session]);

  useEffect(() => {
    if (!email) return;
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [email]);

  if (status === 'loading') {
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

  if (!session) {
    return (
      <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)]" />
        <div className="pointer-events-none absolute left-[-140px] top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-120px] top-[320px] h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
        <Navbar />

        {globalLoading && <LoadingScreen />}

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/88 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-[0_12px_28px_rgba(15,23,42,0.15)]">
                  <ProfileAvatar
                    src={profile_pic}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-3 text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
                <div className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-slate-700 shadow-sm md:justify-start">
                  <Mail size={16} className="text-blue-600" />
                  <span>{email}</span>
                </div>
                <p className="text-sm text-slate-600">
                  Sign in to manage your interview experiences and keep helping juniors prepare better.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" />
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_20px_48px_rgba(15,23,42,0.18)]">
            <Login />
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

      <Navbar />
      <div className="relative mx-auto mt-2 max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="rounded-3xl border border-slate-200/80 bg-white/88 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="relative group">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-[0_12px_28px_rgba(15,23,42,0.15)] transition-transform duration-300 group-hover:scale-105">
                <ProfileAvatar
                  src={profile_pic}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 space-y-3 text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-slate-700 shadow-sm md:justify-start">
                <Mail size={16} className="text-blue-600" />
                <span>{email}</span>
              </div>
              <p className="max-w-xl text-sm text-slate-600">
                Track your interview posts and keep helping juniors prepare better.
              </p>
            </div>
          </div>
        </div>
      </div>

      {globalLoading && <LoadingScreen />}

      <div className="relative mx-auto mt-8 max-w-6xl px-4 pb-14 sm:px-6">
        <section className="rounded-3xl border border-slate-200/80 bg-white/88 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl md:text-2xl">
                Your Experiences
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Total: <span className="font-semibold text-slate-700">{posts.length}</span>
              </p>
            </div>
            {posts.length > 0 && !loadingPosts && (
              <Link href="/post">
                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:-translate-y-[0.5px] hover:from-blue-700 hover:to-indigo-700 sm:px-5 sm:py-2.5 sm:text-sm">
                  <PlusCircle size={16} />
                  <span className="text-xs sm:text-sm">Share Experience</span>
                </button>
              </Link>
            )}
          </div>

          {loadingPosts ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2.5 text-blue-600 shadow-sm">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-semibold">Loading experiences...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600">
                  <PlusCircle size={28} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">No experiences shared yet</h3>
                <p className="mb-7 text-sm text-slate-500 sm:text-base">
                  Your interview story can help juniors prepare smarter. Start with your most recent process and add practical tips.
                </p>
                <div className="flex justify-center">
                  <Link href="/post">
                    <button className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:-translate-y-[0.5px] hover:from-blue-700 hover:to-indigo-700 sm:px-7 sm:py-3">
                      <PlusCircle size={17} />
                      <span>Share Your First Experience</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              {posts.map((post) => (
                <div key={post.uid} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
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
      </div>
    </main>
  );
};

export default ProfilePage;
