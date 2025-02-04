"use client";
import { useState, useEffect } from "react";
import ProfileCard from "../../../components/Card";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { Loader2, ArrowLeft, Search } from "lucide-react";

const SearchPage = ({ params }) => {
  const router = useRouter();
  const { search } = React.use(params);
  const [searchText, setSearchText] = useState(search || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(search || "");

  useEffect(() => {
    if (!search && !searchText) {
      router.push("/search/Himanshu-Nilay-Neeraj");
    }
  }, [search, searchText, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearch.trim() === "") return;
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/search?search=${debouncedSearch}&page=1`
        );
        setResults(response.data.result);
        setHasMore(response.data.result.length === 10);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };
    if (debouncedSearch) {
      fetchResults();
    }
  }, [debouncedSearch]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await axios.get(
        `/api/search?search=${debouncedSearch}&page=${nextPage}`
      );
      const newResults = response.data.result;
      setResults([...results, ...newResults]);
      setPage(nextPage);
      setHasMore(newResults.length === 10);
    } catch (error) {
      console.error("Error loading more results:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchText.trim() !== "") {
      router.push(`/search/${encodeURIComponent(searchText)}`);
    } else {
      router.push(`/search/Himanshu-Nilay-Neeraj`);
    }
  };

  return (
    <div className="max-h-screen p-6 relative">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200 focus:outline-none"
            aria-label="Back to home"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full p-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0B3B8]" />
            </div>
            <button
              type="submit"
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B77F9]"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
        </form>
      </div>
      <div className="max-w-3xl mx-auto">
        {loading && (
          <p className="text-center mt-4 text-gray-600">Loading...</p>
        )}
        <div className="mt-6 space-y-6">
          {results.length > 0
            ? results.map((profile) => (
                <ProfileCard key={profile._id} profile={profile} />
              ))
            : !loading && (
                <p className="text-center text-gray-600">
                  {searchText
                    ? "No results found."
                    : "Please enter a search query."}
                </p>
              )}
          <div className="mt-8 flex flex-col items-center space-y-4">
            {loadingMore && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="animate-spin" size={24} />
                <span>Loading experiences...</span>
              </div>
            )}

            {!loadingMore && hasMore && (
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300 font-medium"
              >
                Load More Experiences
              </button>
            )}

            {!loadingMore && !hasMore && (
              <p className="text-[#B0B3B8] text-lg">You've reached the end of the feed</p>
            )}
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;