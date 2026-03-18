"use client";

import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import FeedCard from "../../components/FeedCard"; // Ensure FeedCard is imported
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import ProfileCardSkeleton from "../../components/ProfileCardSkeleton";

const LoadingScreen = () => (
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
    const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
    const [isShareButtonLoading, setIsShareButtonLoading] = useState(false);

    const observer = useRef();
    const lastProfileElementRef = useCallback((node) => {
        if (pageLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMoreProfiles) {
                setPage((prevPage) => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [pageLoading, hasMoreProfiles]);

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

    const skeletonCards = Array.from({ length: 3 });

    const handleShareExperienceClick = () => {
        setIsShareButtonLoading(true);
    };


    return (
        <main className="min-h-screen bg-[#F0F2F5] font-sans pt-5 md:pt-20">
            <Navbar />
            {isShareButtonLoading && <LoadingScreen />}

            <div className="max-w-4xl mx-auto px-4 pt-16 pb-12">
                <div className="bg-[#F8F9FF] rounded-2xl border border-blue-50/50 p-8 sm:p-10 mb-8 text-center shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Help your community grow
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Your interview journey could be someone else's roadmap to success.
                    </p>
                    <Link href="/post" onClick={handleShareExperienceClick} prefetch={true} scroll={false}>
                        <button className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-blue-700 transition shadow-sm border border-transparent">
                            Share Your Interview Experience
                        </button>
                    </Link>
                </div>

                <div className="space-y-6">
                    {/* Skeletons are visible until profiles are loaded */}
                    {pageLoading && page === 0 && profiles.length === 0 ? (
                        skeletonCards.map((_, index) => <ProfileCardSkeleton key={index} />)
                    ) : (
                        profiles.map((profile, index) => {
                            if (profiles.length === index + 2) {
                                return (
                                    <div ref={lastProfileElementRef} key={profile._id}>
                                        <FeedCard
                                            profile={profile}
                                            width="w-full"
                                            height="min-h-[280px]"
                                        />
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={profile._id}>
                                        <FeedCard
                                            profile={profile}
                                            width="w-full"
                                            height="min-h-[280px]"
                                        />
                                    </div>
                                );
                            }
                        })
                    )}
                </div>

                <div className="mt-8 flex flex-col items-center space-y-4">
                    {pageLoading && page !== 0 && (
                        <div className="flex items-center space-x-2 text-blue-600">
                            <Loader2 className="animate-spin" size={24} />
                            <span>Loading more experiences...</span>
                        </div>
                    )}

                    {!pageLoading && !hasMoreProfiles && profiles.length > 0 && (
                        <p className="text-[#B0B3B8] text-lg"></p>
                    )}
                    {!pageLoading && !hasMoreProfiles && profiles.length === 0 && page === 0 && (
                        <p className="text-[#B0B3B8] text-lg">No experiences available yet.</p>
                    )}
                </div>
            </div>
        </main>
    );
}