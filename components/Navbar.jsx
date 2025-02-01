"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, FileText, LogOut, Search, User, LogIn, Menu, X } from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState("");
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const clearAllSessionData = () => {
    document.cookie.split(";").forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=; max-age=0; path=/`;
    });
    sessionStorage.clear();
    localStorage.clear();
  };

  const handleLogout = async () => {
    clearAllSessionData();
    await signOut({ callbackUrl: "/" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchText.trim() === "" ? "Himanshu-Nilay-Neeraj" : searchText.trim();
    router.push(`/search/${encodeURIComponent(query)}`);
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full transition-transform duration-300 ease-in-out ${
      visible ? 'translate-y-0' : '-translate-y-full'
    } bg-[#F0F2F5] p-4 shadow-md z-50 backdrop-blur-sm bg-opacity-95`}>
      <div className="max-w-7xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex justify-between items-center">
          <div className="flex space-x-6 items-center">
            <div className="text-2xl font-bold text-[#1877F2] hover:text-[#8B77F9] transition-colors">
              <Link href="/">The Interview</Link>
            </div>
            <div className="flex space-x-4">
              <Link href="/home" className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
                <Home size={24} className="text-[#1877F2]" />
                <span className="text-sm mt-1">Home</span>
              </Link>
              <Link href="/post" className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
                <FileText size={24} className="text-[#1877F2]" />
                <span className="text-sm mt-1">Post</span>
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="p-2 pl-10 w-80 border border-[#B0B3B8] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B77F9] focus:border-transparent transition-all duration-300"
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0B3B8]" />
            </div>
            <button type="submit" className="ml-2 p-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B77F9]">
              <Search size={20} />
            </button>
          </form>

          <div className="flex space-x-4 items-center">
            <Link href="/profile" className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
              <User size={24} className="text-[#1877F2]" />
              <span className="text-sm mt-1">Profile</span>
            </Link>
            
            {session ? (
              <button onClick={handleLogout} className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#FF5F5F] hover:text-white transition-all duration-300 text-[#1D1D1D]">
                <LogOut size={24} className="text-[#1877F2]" />
                <span className="text-sm mt-1">Logout</span>
              </button>
            ) : (
              <button onClick={() => signIn("google")} className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
                <LogIn size={24} className="text-[#1877F2]" />
                <span className="text-sm mt-1">Login</span>
              </button>
            )}
          </div>
        </div>

       {/* Mobile Navigation */}
<div className="lg:hidden">
  <div className="flex justify-between items-center">
    <div className="text-xl font-bold text-[#1877F2]">
      <Link href="/">The Interview</Link>
    </div>
    <div className="flex items-center space-x-4">
      {/* Search Icon */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300"
      >
        <Search size={24} className="text-[#1877F2]" />
      </button>
      {/* Hamburger Menu */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300"
      >
        {isMenuOpen ? <X size={24} className="text-[#1877F2]" /> : <Menu size={24} className="text-[#1877F2]" />}
      </button>
    </div>
  </div>

  {/* Mobile Menu */}
  <div className={`${isMenuOpen ? 'block' : 'hidden'} mt-4`}>
    <form onSubmit={handleSearch} className="mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full p-2 pl-10 border border-[#B0B3B8] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B77F9] focus:border-transparent"
        />
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0B3B8]" />
      </div>
      <button type="submit" className="w-full mt-2 p-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300">
        Search
      </button>
    </form>

    <div className="flex flex-col space-y-2">
      <Link href="/home" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
        <Home size={24} className="text-[#1877F2]" />
        <span>Home</span>
      </Link>
      <Link href="/post" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
        <FileText size={24} className="text-[#1877F2]" />
        <span>Post</span>
      </Link>
      <Link href="/profile" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
        <User size={24} className="text-[#1877F2]" />
        <span>Profile</span>
      </Link>
      {session ? (
        <button onClick={handleLogout} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#FF5F5F] hover:text-white transition-all duration-300 text-[#1D1D1D] w-full">
          <LogOut size={24} className="text-[#1877F2]" />
          <span>Logout</span>
        </button>
      ) : (
        <button onClick={() => signIn("google")} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D] w-full">
          <LogIn size={24} className="text-[#1877F2]" />
          <span>Login</span>
        </button>
      )}
    </div>
  </div>
</div>

      </div>
    </nav>
  );
}