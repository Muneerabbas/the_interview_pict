"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import FeedExperienceCard from "@/components/FeedExperienceCard";

const SearchPage = ({ params }) => {
  const router = useRouter();
  const { search } = React.use(params);
  const activeSearch = typeof search === "string" && search.trim() ? decodeURIComponent(search) : "interview";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/search?search=${encodeURIComponent(activeSearch)}&page=${nextPage}`);
      if (!response.ok) throw new Error("Failed to load more");
      const data = await response.json();
      const newResults = data.result || [];
      setResults((prev) => [...prev, ...newResults]);
      setPage(nextPage);
      setHasMore(newResults.length === 10);
    } catch (error) {
      console.error("Error loading more results:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [activeSearch, hasMore, loadingMore, page]);

  const lastProfileElementRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, loadMore, loadingMore]
  );

  useEffect(() => {
    if (!search || !String(search).trim()) {
      router.replace("/search/interview");
    }
  }, [router, search]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!activeSearch.trim()) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/search?search=${encodeURIComponent(activeSearch)}&page=1`);
        if (!response.ok) throw new Error("Failed to fetch results");
        const data = await response.json();
        const initialResults = data.result || [];
        setResults(initialResults);
        setHasMore(initialResults.length === 10);
        setPage(1);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [activeSearch]);

  return (
    <main className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 rounded-2xl border border-slate-800 bg-surface-dark p-4 text-sm text-slate-400">
          Showing results for: <span className="font-semibold text-primary">{activeSearch}</span>
        </div>

        {loading && (
          <div className="mb-4 flex items-center justify-center gap-2 text-primary">
            <Loader2 className="animate-spin" size={20} />
            <span>Searching...</span>
          </div>
        )}

        <div className="space-y-6">
          {results.length > 0
            ? results.map((profile, index) => {
                const key = profile?._id || profile?.uid || `search-${index}`;
                if (results.length === index + 2) {
                  return (
                    <div ref={lastProfileElementRef} key={key}>
                      <FeedExperienceCard profile={profile} />
                    </div>
                  );
                }
                return (
                  <div key={key}>
                    <FeedExperienceCard profile={profile} />
                  </div>
                );
              })
            : !loading && (
                <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  No results found.
                </p>
              )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 pb-8">
          {loadingMore && (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="animate-spin" size={22} />
              <span>Loading experiences...</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default SearchPage;
