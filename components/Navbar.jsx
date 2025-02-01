"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // For navigation
import Link from "next/link";
import { Home, FileText, LogOut, Search , User } from "lucide-react"; // Icons
import { useSession, signOut, signIn } from "next-auth/react"; // Import signIn here

export default function Navbar() {
  const { data: session } = useSession(); // Get session data
  const [searchText, setSearchText] = useState(""); // For search text input
  const router = useRouter(); // Router for navigation

  // Clear all session data (cookies, localStorage, sessionStorage)
  const clearAllSessionData = () => {
    // 1. Clear cookies
    document.cookie.split(";").forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=; max-age=0; path=/`; // Expire the cookie immediately
    });

    // 2. Clear sessionStorage
    sessionStorage.clear();

    // 3. Clear localStorage
    localStorage.clear();
  };

  // Handle logout
  const handleLogout = async () => {
    clearAllSessionData(); // Clear cookies and storage
    await signOut({ callbackUrl: "/" }); // Logout and redirect to home
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchText.trim() === "" ? "Himanshu-Nilay-Neeraj" : searchText.trim();
    router.push(`/search/${encodeURIComponent(query)}`); // Update the URL with the search query
  };
  
  return (
    <nav className="w-full bg-white p-4 shadow-sm flex justify-between items-center">
      {/* Left Links */}
      <div className="flex space-x-6 items-center">
        {/* The Interview */}
        <div className="text-xl font-bold text-interview-blue">
          <Link href="/">The Interview</Link>
        </div>

        {/* Home */}
        <li className="flex flex-col items-center">
          <Link href="/home" className="text-black flex flex-col items-center">
            <Home size={24} />
            <span className="text-sm">Home</span>
          </Link>
        </li>

        {/* Post */}
        <li className="flex flex-col items-center">
          <Link href="/post" className="text-black flex flex-col items-center">
            <FileText size={24} />
            <span className="text-sm">Post</span>
          </Link>
        </li>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Search size={20} />
        </button>
      </form>

      {/* Right Links */}
      <ul className="flex space-x-6 items-center">
        {/* Profile */}
        <li className="flex flex-col items-center">
          <Link href="/profile" className="text-black flex flex-col items-center hover:text-blue-500 transition duration-300">
            <User size={24} />
            <span className="text-sm">Profile</span>
          </Link>
        </li>

        {/* Logout / Login */}
        {session ? (
          <li className="flex flex-col items-center">
            <button
              onClick={handleLogout}
              className="text-black flex flex-col items-center hover:text-yellow-500 transition duration-300"
            >
              <LogOut size={24} />
              <span className="text-sm">Logout</span>
            </button>
          </li>
        ) : (
          <li className="flex flex-col items-center">
            <button
              onClick={() => signIn("google")} 
              className="text-black flex flex-col items-center hover:text-blue-500 transition duration-300"
            >
              <span className="text-sm">Login</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
