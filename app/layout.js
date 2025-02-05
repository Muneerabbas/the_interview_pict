// app/layout.js  <-- Make sure this is in your app/layout.js file
"use client"; // Keep this line

import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from ".././components/Footer"; // Adjust path if needed
import { usePathname } from "next/navigation";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'; // Import GoogleAnalytics

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

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>

        {/* Conditionally render Footer */}
        {!isSearchPage && <Footer />}

        {/* Google Analytics Integration */}
        <GoogleAnalytics gaId="G-EBQQJCL50P" /> {/* Add GoogleAnalytics component here with your GA4 Measurement ID */}
      </body>
    </html>
  );
}