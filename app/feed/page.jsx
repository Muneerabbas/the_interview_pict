"use client";

import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import ProfileCard from "../../components/Card";
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import ProfileCardSkeleton from "../../components/ProfileCardSkeleton";

const LoadingScreen = () => ( // Reusing LoadingScreen component from previous steps
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

export default function HomePage() {
    const { data: session } = useSession();
    const [profiles, setProfiles] = useState([]);
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pageLoading, setPageLoading] = useState(false);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
    const [isShareButtonLoading, setIsShareButtonLoading] = useState(false); // ADDED: Loading state for Share button
    const [postCount, setPostCount] = useState(null);

    // console.log("HomePage Component Rendered"); // ADDED: Log when HomePage renders
    // console.log("Initial globalLoading:", globalLoading); // ADDED: Log initial globalLoading
    useEffect(() => {
        const fetchPostCount = async () => {
            try {
                const response = await axios.get("/api/postsCount");
                setPostCount(response.data.count);
                console.log("posts: ",response.data.count)
            } catch (error) {
                console.error("Error fetching post count:", error);
            }
        };
    
        fetchPostCount();
    }, []);
    

    const fetchProfiles = async (pageNumber, itemsPerPage) => {
        setPageLoading(true);
        try {
            const response = await axios.get(`/api/feed?page=${pageNumber}&itemsPerPage=${itemsPerPage}`);
            if (response.data && response.data.length > 0) {
                setProfiles((prev) => {
                    const uniqueProfiles = [
                        ...new Map(prev.concat(response.data).map((item) => [item._id, item])).values(),
                    ];
                    return uniqueProfiles;
                });
                if (response.data.length < itemsPerPage) {
                    setHasMoreProfiles(false);
                }
            } else {
                setHasMoreProfiles(false);
                if (pageNumber === 0 && response.data.length === 0) {
                    setProfiles([]);
                }
            }
        } catch (error) {
            console.error("Error fetching profiles:", error);
            setHasMoreProfiles(false);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        setHasMoreProfiles(true);
        fetchProfiles(page, itemsPerPage);
    }, [page, itemsPerPage]);

    const handleLoadMore = () => {
        if (!pageLoading && hasMoreProfiles) {
            setPage((prev) => prev + 1);
        }
    };

    const skeletonCards = Array.from({ length: 3 });

    const handleShareExperienceClick = () => { // ADDED: Handler for Share button click
        setIsShareButtonLoading(true);
        // No need to setIsLoadingShareButtonLoading(false) because page navigation will unmount the component
    };


    return (
        <main className="min-h-screen bg-[#F0F2F5] font-sans pt-5 md:pt-20">
            <Navbar />
            {isShareButtonLoading && <LoadingScreen />} {/* ADDED: Conditional rendering of LoadingScreen */}

            {globalLoading && <LoadingScreen />} {/* UPDATED: Replaced existing loading UI with LoadingScreen */}


            <div className="max-w-4xl mx-auto px-4 pt-16 pb-12">
                {session ? (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <img
                                    src={session.user.image || "/api/placeholder/96/96"}
                                    alt="User"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-600"
                                />
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#00C853] border-4 border-white rounded-full"></div>
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1D1D1D] mb-2">
                            Welcome, {session.user.name}
                        </h1>

                        <Link href="/post" onClick={handleShareExperienceClick}> {/* MODIFIED: Added onClick handler */}
                            <button className="bg-[#E7F3FF] text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-300 mt-4">
                                Share Your Interview Experience
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
                        <Link href="/post" onClick={handleShareExperienceClick}> {/* MODIFIED: Added onClick handler */}
                            <button className="bg-[#E7F3FF] text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-300">
                                Share Your Interview Experience
                            </button>
                        </Link>
                    </div>
                )}

<div className="flex justify-end text-black font-bold p-2">
    {postCount !== null ? postCount : "Loading..."} Experiences
</div>
                <div className="space-y-6">
                    {/* Skeletons are visible until profiles are loaded */}
                    {pageLoading && page === 0 && profiles.length === 0 ? (
                        skeletonCards.map((_, index) => <ProfileCardSkeleton key={index} />)
                    ) : (
                        profiles.map((profile) => (
                            <ProfileCard
                                key={profile._id}
                                profile={profile}
                                width="w-full"
                                height="min-h-[280px]"
                                setGlobalLoading={setGlobalLoading} // Pass setGlobalLoading here
                            />
                        ))
                    )}
                </div>

                <div className="mt-8 flex flex-col items-center space-y-4">
                    {pageLoading && page !== 0 && !globalLoading && (
                        <div className="flex items-center space-x-2 text-blue-600">
                            <Loader2 className="animate-spin" size={24} />
                            <span>Loading more experiences...</span>
                        </div>
                    )}

                    {!pageLoading && hasMoreProfiles && !globalLoading && (
                        <button
                            onClick={handleLoadMore}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300 font-medium"
                        >
                            Load More Experiences
                        </button>
                    )}

                    {!pageLoading && !hasMoreProfiles && profiles.length > 0 && !globalLoading && (
                        <p className="text-[#B0B3B8] text-lg">You've reached the end of the feed</p>
                    )}
                    {!pageLoading && !hasMoreProfiles && profiles.length === 0 && page === 0 && !globalLoading && (
                        <p className="text-[#B0B3B8] text-lg">No experiences available yet.</p>
                    )}
                </div>
            </div>
        </main>
    );
}