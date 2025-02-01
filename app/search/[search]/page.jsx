"use client";

import { useState, useEffect } from "react";
import ProfileCard from "../../../components/Card";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react"; // Import React explicitly

const SearchPage = ({ params }) => {
  const router = useRouter();
  const { search } = React.use(params); // Unwrap params with React.use()

  const [searchText, setSearchText] = useState(search || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search || "");

  useEffect(() => {
    if (!search && !searchText) {
      router.push("/search/Himanshu-Nilay-Neeraj");  // Redirect to default search query
    }
  }, [search, searchText, router]);

  // Debounce function to delay search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText); // Set the debounced search value after 300ms
    }, 300); // 300ms debounce time

    return () => clearTimeout(timer); // Cleanup the timeout if searchText changes
  }, [searchText]);

  // Fetch search results based on debouncedSearch
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearch.trim() === "") return; // Do nothing if search text is empty
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/search?search=${debouncedSearch}`
        );
        setResults(response.data.result);
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

  // Handle form submission for manual search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchText.trim() !== "") {
      router.push(`/search/${encodeURIComponent(searchText)}`); // Update URL for search query
    } else {
      router.push(`/search/Himanshu-Nilay-Neeraj`); // Navigate to search page without query
    }
  };

  return (
    <div className="max-h-screen p-6 relative">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.push("/home")}
          className="p-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none"
        >
          Home
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSearch}
          className="flex items-center space-x-2 mb-6"
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Search
          </button>
        </form>
      </div>

      <div className="max-w-3xl mx-auto">
        {loading && (
          <p className="text-center mt-4 text-gray-600">Loading...</p>
        )}

        <div className="mt-6 space-y-6"> {/* Added space-y-6 here */}
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
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
