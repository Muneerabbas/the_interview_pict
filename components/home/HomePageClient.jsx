"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import CommunitySection from "./CommunitySection";
import FeaturedSection from "./FeaturedSection";
import HeroSection from "./HeroSection";
import SearchSection from "./SearchSection";
import TestimonialsSection from "./TestimonialsSection";
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
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(13,127,242,0.12),transparent_35%),radial-gradient(circle_at_80%_18%,rgba(56,189,248,0.08),transparent_32%)]" />
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <SearchSection popularCompanies={companies} />
        <FeaturedSection stories={featured} />
        <CommunitySection items={community} />
        <TestimonialsSection />
      </main>

      <Footer />
    </div>
  );
}
