"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import Footer from "../components/Footer";

export default function Providers({ children }) {
  const pathname = usePathname();
  const isSearchPage = pathname?.startsWith("/search/");
  const isAboutPage = pathname?.startsWith("/about");

  return (
    <>
      <SessionProvider>{children}</SessionProvider>
      {!isSearchPage && !isAboutPage && <Footer isLandingPage={pathname === "/"} />}
      <GoogleAnalytics gaId="G-EBQQJCL50P" />
      <SpeedInsights />
      <Analytics />
    </>
  );
}

