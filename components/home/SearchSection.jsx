"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchSection({ popularCompanies = [] }) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const submitSearch = (query) => {
    const cleaned = query.trim() || "interview";
    router.push(`/search/${encodeURIComponent(cleaned)}`);
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch(searchText);
          }}
          className="group relative"
        >
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary">
            <Search size={24} />
          </div>
          <input
            className="h-20 w-full rounded-3xl border border-slate-200 bg-white pl-16 pr-6 text-xl font-medium text-slate-900 shadow-2xl shadow-slate-900/10 transition-all placeholder:text-slate-500 focus:border-primary focus:ring-4 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white"
            placeholder="Search by Company, Role, or Tech Stack..."
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Popular:</span>
          {popularCompanies.map((company) => (
            <button
              key={company}
              onClick={() => submitSearch(company)}
              className="rounded-full border border-transparent bg-slate-100 px-5 py-2 text-sm font-bold transition-all hover:border-primary/50 hover:text-primary dark:border-slate-700/50 dark:bg-slate-800/50"
            >
              {company}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
