"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import FeedCard from "@/components/FeedCard";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import Navbar from "@/components/Navbar";

const SearchPage = () => {
  const router = useRouter();
  const params = useParams();
  const rawSearchParam = params?.search;
  const search = Array.isArray(rawSearchParam) ? rawSearchParam[0] : rawSearchParam;

  const decodedSearch = search ? decodeURIComponent(search) : "";
  const initialSearchText = decodedSearch === "Himanshu-Nilay-Neeraj" ? "" : decodedSearch;

  const [searchText, setSearchText] = useState(initialSearchText);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(decodedSearch);
  const [globalLoading, setGlobalLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("experience"); // 'experience' or 'tale'

  const observer = useRef();
  const lastProfileElementRef = useCallback((node) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    if (!search && !searchText) {
      router.push("/search/Himanshu-Nilay-Neeraj");
    }
  }, [search, searchText, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim() === "" ? "Himanshu-Nilay-Neeraj" : searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchResults = useCallback(async (isLoadMore = false) => {
    if (!debouncedSearch) return;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setResults([]);
    }

    try {
      const pageToFetch = isLoadMore ? page + 1 : 1;
      const response = await axios.get(
        `/api/search?search=${debouncedSearch}&page=${pageToFetch}&type=${activeTab}`
      );

      const newResults = response.data.result;
      if (isLoadMore) {
        setResults(prev => [...prev, ...newResults]);
        setPage(pageToFetch);
      } else {
        setResults(newResults);
        setPage(1);
      }
      setHasMore(newResults.length === 10);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, activeTab, page]);

  useEffect(() => {
    fetchResults(false);
  }, [debouncedSearch, activeTab]);

  const loadMore = () => {
    fetchResults(true);
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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fafcff] pb-20 pt-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] top-[-10%] h-[50vh] w-[50vw] rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-500/15" />
        <div className="absolute -right-[10%] top-[20%] h-[60vh] w-[60vw] rounded-full bg-cyan-300/10 blur-[130px] dark:bg-cyan-500/12" />
        <div className="absolute top-[30%] left-[20%] h-[50vh] w-[50vw] rounded-full bg-indigo-300/10 blur-[100px] dark:bg-indigo-500/12" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]" />
      </div>

      {globalLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm dark:bg-slate-900/60 transition-colors duration-500">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-6 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.2)] dark:border-slate-700/80 dark:bg-slate-800/95 transition-colors duration-500">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Processing...</span>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
        <form onSubmit={handleSearch} className="mb-6 mt-6 flex items-center gap-3 sm:gap-4 relative z-20">
          <button
            type="button"
            onClick={() => router.push("/feed")}
            className="group flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl transition-all hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Back to feed"
          >
            <ArrowLeft size={24} className="text-slate-500 transition-transform group-hover:-translate-x-1 dark:text-slate-400" />
          </button>

          <div className="group relative flex flex-1 items-center justify-between overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-1.5 sm:p-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:ring-[4px] focus-within:ring-blue-500/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] dark:focus-within:border-cyan-500/50 dark:focus-within:bg-slate-900 dark:focus-within:ring-[4px] dark:focus-within:ring-cyan-500/20">
            <div className="relative z-10 flex flex-1 items-center">
              <Search size={22} className="absolute left-3 sm:left-4 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500 dark:group-focus-within:text-cyan-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-transparent py-2.5 pl-11 pr-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 sm:py-3.5 sm:pl-12 sm:text-lg"
              />
            </div>

            <button
              type="submit"
              className="relative z-10 flex h-11 w-11 sm:h-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-[1px] hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40 active:scale-95 focus:outline-none sm:w-auto sm:px-6"
              aria-label="Search"
            >
              <Search size={20} className="transition-transform group-hover:scale-110 sm:hidden" />
              <span className="hidden text-base font-semibold tracking-wide sm:block">Search</span>
            </button>
          </div>
        </form>

        <div className="mb-8 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <button
              onClick={() => setActiveTab("experience")}
              className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all ${activeTab === "experience"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
            >
              Interviews
            </button>
            <button
              onClick={() => setActiveTab("tale")}
              className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all ${activeTab === "tale"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
            >
              Tales
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2.5 text-blue-600 shadow-sm transition-colors duration-500 dark:border-blue-900/50 dark:bg-slate-800 dark:text-blue-400">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm font-semibold">Searching...</span>
            </div>
          </div>
        )}
        <div className="mt-6 space-y-6">
          {results.length > 0
            ? results.map((profile, index) => {
              if (results.length === index + 2) {
                return (
                  <div ref={lastProfileElementRef} key={profile._id}>
                    <FeedCard profile={profile} />
                  </div>
                );
              } else {
                return (
                  <div key={profile._id}>
                    <FeedCard profile={profile} />
                  </div>
                );
              }
            })
            : !loading && (
              <div className="flex h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white text-slate-500 shadow-sm transition-colors duration-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 mt-4">
                <Search size={40} className="mb-3 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  {searchText ? "No experiences found" : "Enter a search query"}
                </h3>
                <p className="mt-1 text-sm text-center px-4 max-w-sm">
                  {searchText ? "Try adjusting your search terms or exploring the feed." : "Search for companies, roles, or candidate names."}
                </p>
              </div>
            )}
          <div className="mt-8 flex flex-col items-center space-y-4">
            {loadingMore && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="animate-spin" size={24} />
                <span>Loading experiences...</span>
              </div>
            )}

            {!loadingMore && !hasMore && results.length > 0 && (
              <p className="text-[#B0B3B8] text-lg"></p>
            )}
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
