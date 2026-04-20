"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import Footer from "../components/Footer";
import { AuthModalProvider } from "../components/AuthModalProvider";

export default function Providers({ children }) {
  const pathname = usePathname();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <AuthModalProvider>{children}</AuthModalProvider>
      </SessionProvider>
      <Footer isLandingPage={pathname === "/"} />
      <GoogleAnalytics gaId="G-EBQQJCL50P" />
      <SpeedInsights />
      <Analytics />
    </ThemeProvider>
  );
}
