"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Edit, Trash2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Login from '../../components/Login';
import ProfileCard from '../../components/Card'; // Import the ProfileCard component
// import { useRouter } from "next/navigation";



const ProfilePage = () => {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const { name, email, image: profile_pic } = session?.user || {}; // Avoid errors when session is null

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
  }, [email]); // Ensure hooks run in the correct order

//   const router = useRouter();

 

  const handleDelete = (postId) => {
    console.log('Delete post:', postId);
    // Add your delete logic here
  };
  


  return (
    <div>
      <Navbar />

      {status === 'loading' && <p>Loading...</p>}

      {!session ? (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="p-6 bg-white shadow-lg rounded-lg -mt-[300px]">
            <Login />
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <div className="bg-white border border-gray-300 rounded-xl shadow-md p-6">
            {/* Profile Section */}
            <div className="flex items-center mb-6">
              <div className="w-24 h-24 mr-4">
                <img
                  src={profile_pic || '/default-profile.jpg'}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
                <p className="text-sm text-gray-600">{email}</p>
              </div>
            </div>

            {/* Posts Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Posts</h2>
              {loadingPosts ? (
                <p>Loading posts...</p>
              ) : posts.length === 0 ? (
                <p>No posts found.</p>
              ) : (
                posts.map((post) => (
                  <div key={post._id} className="mb-4">
                    <ProfileCard 
                      profile={post} 
                      edit={true} // Always show edit button
                      deletePost={true} // Always show delete button
                    
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
