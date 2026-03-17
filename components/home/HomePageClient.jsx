"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import CommunitySection from "./CommunitySection";
import FeaturedSection from "./FeaturedSection";
import HeroSection from "./HeroSection";
import SearchSection from "./SearchSection";
import { buildUniqueStories, communityStories, topCompanies } from "./homeUtils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePageClient({ topStories = [], featuredStories = [] }) {
  useSession();

  const allStories = useMemo(
    () => buildUniqueStories(topStories, featuredStories),
    [featuredStories, topStories]
  );

  const featured = useMemo(() => {
    const source = topStories.length ? topStories : allStories;
    return source.slice(0, 6);
  }, [allStories, topStories]);

  const bottomTopStories = useMemo(() => {
    const source = topStories.length ? topStories : allStories;
    const nextStories = source.slice(6, 9);
    return nextStories.length ? nextStories : source.slice(0, 3);
  }, [allStories, topStories]);

  const companies = useMemo(() => topCompanies(allStories, 5), [allStories]);
  const community = useMemo(() => communityStories(bottomTopStories, 3), [bottomTopStories]);

  return (
    <div className="dark relative flex min-h-screen flex-col overflow-x-hidden bg-background-light font-display text-slate-900 antialiased transition-colors duration-300 dark:bg-background-dark dark:text-slate-200">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <SearchSection popularCompanies={companies} />
        <CommunitySection items={community} />
        <FeaturedSection stories={featured} />
      </main>

      <Footer />
    </div>
  );
}
