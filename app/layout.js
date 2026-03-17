// app/layout.js  <-- Make sure this is in your app/layout.js file
"use client"; // Keep this line
import Script from "next/script";

import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from ".././components/Footer"; // Adjust path if needed
import { usePathname } from "next/navigation";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'; // Import GoogleAnalytics
import { SpeedInsights } from '@vercel/speed-insights/next'; // Import SpeedInsights

// Custom fonts setup
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isSearchPage = pathname?.startsWith("/search/");
  const isAboutPage = pathname?.startsWith("/about");

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
        <meta name="google-adsense-account" content="ca-pub-9530051498159475"/>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9530051498159475" crossOrigin="anonymous"></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>

        {/* Conditionally render Footer */}
        {!isSearchPage && !isAboutPage && <Footer />  }

        {/* Google Analytics Integration */}
        <GoogleAnalytics gaId="G-EBQQJCL50P" /> {/* Add GoogleAnalytics component here with your GA4 Measurement ID */}
        
        {/* Vercel Speed Insights */}
        <SpeedInsights />
      </body>
    </html>
  );
}