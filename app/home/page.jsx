"use client";

import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import ProfileCard from "../../components/Card";
import { useEffect, useState } from "react";
import axios from "axios";

export default function HomePage() {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true); // To track if there are more profiles to load

  // Fetch profiles from the API
  const fetchProfiles = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/feed?page=${pageNumber}`);
      setProfiles((prev) => {
        // Remove duplicates based on profile._id
        const uniqueProfiles = [
          ...new Map(prev.concat(response.data).map((item) => [item._id, item])).values(),
        ];
        return uniqueProfiles;
      });

      // If no profiles are returned, set hasMoreProfiles to false
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
    fetchProfiles(page); // Fetch profiles when page changes
  }, [page]);

  // Handle load more button click
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen font-sans relative">
      <div className={`transition-all`}>
        <Navbar />

        {/* User Profile Image */}
        {session && (
          <div className="flex justify-center mt-6 mb-3">
            <img
              src={session.user.image || "/default-profile.png"}
              alt="User Image"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
          </div>
        )}

        {/* Welcome Message */}
        <div className="text-center py-1">
          {session && (
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome, {session.user.name}
            </h1>
          )}
        </div>

        {/* Profiles Section */}
        <div className="max-w-4xl mx-auto mt-8 space-y-4">
          {profiles.map((profile) => (
            <ProfileCard key={profile._id} profile={profile} />
          ))}
        </div>

        {/* Load More Button or "You have reached the end" message */}
        {!loading && hasMoreProfiles && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Load More
            </button>
          </div>
        )}

        {/* "You have reached the end" message */}
        { !loading && !hasMoreProfiles && (
          <div className="flex justify-center mt-6">
            <p className="text-gray-600">You have reached the end</p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center mt-4">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}
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