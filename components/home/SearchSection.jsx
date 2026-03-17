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
    <section className="px-4 pb-8 pt-1">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-3.5 shadow-[0_10px_30px_rgba(2,6,23,0.45)] backdrop-blur-sm sm:p-4">
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
            className="h-16 w-full rounded-2xl border border-slate-700 bg-slate-950/70 pl-14 pr-5 text-base font-medium text-slate-100 shadow-inner transition-all placeholder:text-slate-500 focus:border-primary focus:ring-4 focus:ring-primary/20"
            placeholder="Search by Company, Role, or Tech Stack..."
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Popular:</span>
          {popularCompanies.map((company) => (
            <button
              key={company}
              onClick={() => submitSearch(company)}
              className="rounded-full border border-slate-700/70 bg-slate-800/60 px-4 py-1.5 text-xs font-bold text-slate-300 transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
            >
              {company}
            </button>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
