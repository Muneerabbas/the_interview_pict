"use client";

import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import ProfileCard from "../../components/Card";
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);

  const fetchProfiles = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/feed?page=${pageNumber}`);
      setProfiles((prev) => {
        const uniqueProfiles = [
          ...new Map(prev.concat(response.data).map((item) => [item._id, item])).values(),
        ];
        return uniqueProfiles;
      });

      if (response.data.length === 0) {
        setHasMoreProfiles(false);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles(page);
  }, [page]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] font-sans pt-5 md:pt-20">

      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">
        {session && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={session.user.image || "/api/placeholder/96/96"}
                  alt="User"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#1877F2]"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#00C853] border-4 border-white rounded-full"></div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1D1D1D] mb-2">
              Welcome, {session.user.name}
            </h1>
            <p className="text-[#B0B3B8]">Share your interview experience with others</p>
          </div>
        )}

        <div className="space-y-6">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile._id}
              profile={profile}
              width="w-full"
              height="min-h-[280px]"
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center space-y-4">
          {loading && (
            <div className="flex items-center space-x-2 text-[#1877F2]">
              <Loader2 className="animate-spin" size={24} />
              <span>Loading experiences...</span>
            </div>
          )}

          {!loading && hasMoreProfiles && (
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300 font-medium"
            >
              Load More Experiences
            </button>
          )}

          {!loading && !hasMoreProfiles && (
            <p className="text-[#B0B3B8] text-lg">You've reached the end of the feed</p>
          )}
        </div>
      </div>
    </main>
  );
}

// // Removed the login check and Login overlay
// {
//   /* Login Overlay */
// }
// {
//   !session && (
//     <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
//       <div className="p-6 bg-white shadow-lg rounded-lg -mt-[300px]">
//         <p className="text-lg font-bold mb-4">
//           You must be logged in to view this page.
//         </p>
//         <Login />
//       </div>
//     </div>
//   );
// }