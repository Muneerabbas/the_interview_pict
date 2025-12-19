"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Edit, Trash2, UserCircle, Mail, PlusCircle, Loader2 } from 'lucide-react';
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

  console.log("ProfilePage: Initial globalLoading state:", globalLoading); // Debugging log - initial state

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
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-xl font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <Navbar />

        {globalLoading && <LoadingScreen />} {/* ADDED: LoadingScreen component here */}

        <div className="relative h-96 bg-gradient-to-r from-blue-600/10 to-[#8B77F9]/10 ">
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
    <div className="min-h-screen bg-[#F0F2F5]">
      <Navbar />
      <div className="relative h-96 bg-gradient-to-r from-blue-600/10 to-[#8B77F9]/10 mt-2 md:mt-1">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-5xl mx-auto px-4 ">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {globalLoading && <LoadingScreen />} {/* UPDATED: Replaced existing loading UI with LoadingScreen */}

      <div className="max-w-5xl mx-auto px-4 ">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#1D1D1D]">
            Your Experiences
          </h2>
          {posts.length > 0 && (
            <Link href="/post">
              <button className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-600/90 transition-colors duration-300 shadow-sm text-xs sm:text-sm">
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
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="text-[#1D1D1D] mb-6">No experiences shared yet</div>
            <div className="flex justify-center">
              <Link href="/post">
                <button className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-600/90 transition-all duration-300 shadow-sm text-xs sm:text-sm">
                  <PlusCircle size={16} />
                  <span className="text-xs sm:text-sm">Share Your First Experience</span>
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <div key={post.uid} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
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
      <br /><br />
    </div>
  );
};

export default ProfilePage;