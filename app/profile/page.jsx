"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Edit, Trash2, UserCircle, Mail, PlusCircle } from 'lucide-react';
import Link from 'next/link';

import Navbar from '../../components/Navbar';
import Login from '../../components/Login';
import ProfileCard from '../../components/Card';

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const { name, email, image: profile_pic } = session?.user || {};

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
      <div className="min-h-screen bg-[#F0F2F5]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-[#1877F2] text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Navbar />
      
      {/* Profile Header with responsive margin-top */}
      <div className="bg-white shadow-sm border-b border-[#E7F3FF]">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:mt-[60px] md:mt-[80px] lg:mt-[95px]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-[#1877F2] overflow-hidden">
              <img
                src={profile_pic || "/api/placeholder/128/128"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-[#1D1D1D] mb-2">{name}</h1>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2 text-[#B0B3B8]">
                  <Mail size={16} className="text-[#1877F2]" />
                  <span>{email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-[#1D1D1D] mb-6">Your Experiences</h2>
        
        {loadingPosts ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-[#1877F2]">Loading experiences...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-[#E7F3FF]">
            <div className="text-[#B0B3B8] mb-4">No experiences shared yet</div>
            <Link href="/post">
      <button className="bg-[#E7F3FF] text-[#1877F2] px-4 py-2 rounded-lg hover:bg-[#1877F2] hover:text-white transition-colors duration-300">
        Share Your First Experience
      </button>
    </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <ProfileCard
                key={post.uid}
                profile={post}
                edit={true}
                deletePost={true}
                disableCardClick={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
