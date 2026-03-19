"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Mail, PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Login from '../../components/Login';
import ProfileCard from '../../components/Card';
import ProfileAvatar from '../../components/ProfileAvatar';

const LoadingScreen = () => ( // LoadingScreen component - Ensure this is exactly the same as in HomePage
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-xl font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        {globalLoading && <LoadingScreen />} {/* ADDED: LoadingScreen component here */}

        <div className="relative h-96 bg-gradient-to-r from-blue-600/10 to-violet-500/10">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-5xl mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                    <ProfileAvatar
                      src={profile_pic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-3">
                  <h1 className="text-3xl font-bold text-[#1D1D1D]">{name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-[#1D1D1D] bg-white/80 px-4 py-2 rounded-full shadow-sm">
                    <Mail size={16} className="text-blue-600" />
                    <span>{email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-[#F0F2F5]/80 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <Login />
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="relative h-96 bg-gradient-to-r from-blue-600/10 to-violet-500/10 mt-2 md:mt-1">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-5xl mx-auto px-4 w-full">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  <ProfileAvatar
                    src={profile_pic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-3">
                <h1 className="text-3xl font-bold text-[#1D1D1D]">{name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-[#1D1D1D] bg-white/80 px-4 py-2 rounded-full shadow-sm">
                  <Mail size={16} className="text-blue-600" />
                  <span>{email}</span>
                </div>
                <p className="text-sm text-slate-600 max-w-xl">
                  Track your interview posts and keep helping juniors prepare better.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {globalLoading && <LoadingScreen />} {/* UPDATED: Replaced existing loading UI with LoadingScreen */}

      <div className="max-w-5xl mx-auto px-4 pb-12 mt-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#1D1D1D]">
              Your Experiences
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Total: <span className="font-semibold text-slate-700">{posts.length}</span>
            </p>
          </div>
          {posts.length > 0 && !loadingPosts && (
            <Link href="/post">
              <button className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-600/90 transition-colors duration-300 shadow-sm text-xs sm:text-sm font-medium">
                <PlusCircle size={16} />
                <span className="text-xs sm:text-sm">Share Experience</span>
              </button>
            </Link>
          )}
        </div>

        {loadingPosts ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="animate-spin" size={24} />
              <span>Loading experiences...</span>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
                <PlusCircle size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No experiences shared yet</h3>
              <p className="text-sm sm:text-base text-slate-500 mb-7">
                Your interview story can help juniors prepare smarter. Start with your most recent process and add practical tips.
              </p>
              <div className="flex justify-center">
                <Link href="/post">
                  <button className="inline-flex items-center gap-2.5 px-5 py-2.5 sm:px-7 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 shadow-sm text-sm font-semibold">
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
              <div key={post.uid} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
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
      </div>
    </div>
  );
};

export default ProfilePage;