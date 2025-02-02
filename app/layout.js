// layout.js
"use client"; // Add this line

import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from ".././components/Footer"; // Adjust path to where your Footer component is located
import { usePathname } from "next/navigation"; // Import usePathname
import "./globals.css";

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
  const pathname = usePathname(); // Get the current path

  // Check if the current path is `/search/[search]`
  const isSearchPage = pathname?.startsWith("/search/");

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>

        {/* Conditionally render Footer */}
        {!isSearchPage && <Footer />}
      </body>
    </html>
  );
}
