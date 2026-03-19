"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  FileText,
  LogOut,
  Search,
  User,
  LogIn,
  Menu,
  X,
  List,
} from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import logo from "../public/icon.svg";

export default function Navbar() {
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const texts = ["Company", "Batch", "Role", "Candidate"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const router = useRouter();
  const pathname = usePathname();

  // Close mobile menu on route change.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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

  const handleLogin = () => {
    router.push("/login");
  };

  const navItems = useMemo(
    () => [
      { href: "/", label: "Home", Icon: Home },
      { href: "/feed", label: "Feed", Icon: List },
      { href: "/post", label: "Post", Icon: FileText },
      { href: "/profile", label: "Profile", Icon: User },
    ],
    []
  );

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <>
      <nav
        className="fixed top-0 w-full z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          {/* Brand */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-semibold tracking-tight transition-all active:scale-95 text-slate-900"
          >
            <div className="relative flex items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform group-hover:scale-105">
              <Image src={logo} alt="theInterview Logo" width={34} height={34} priority className="rounded-xl" />
            </div>
            <span className="text-lg sm:text-xl font-bold">
              the<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Interview</span>
            </span>
          </Link>

          {/* Desktop: search + links */}
          <div className="hidden lg:flex flex-1 items-center justify-center px-8">
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="relative group">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                />
                <input
                  type="text"
                  value={searchText}
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-11 pr-28 text-sm shadow-inner transition-all duration-300 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for"
                />

                {!searchText && (
                  <div className="pointer-events-none absolute left-[116px] top-1/2 -translate-y-1/2 overflow-hidden h-5 w-28">
                    <AnimatePresence mode="sync">
                      <motion.div
                        key={index}
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute w-full text-sm font-medium text-blue-500"
                      >
                        {texts[index]}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-[0.5px] hover:shadow-blue-500/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Desktop: nav items + auth */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={[
                  "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all active:scale-95",
                  isActive(href)
                    ? "bg-indigo-50/80 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
                ].join(" ")
              }
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-200 ${isActive(href) ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
                />
                <span>{label}</span>
              </Link>
            ))}

            <div className="ml-2 h-8 w-px bg-slate-200/80" />

            {session ? (
              <button
                onClick={handleLogout}
                className="ml-2 inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition-all active:scale-95 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="ml-2 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-slate-800 hover:shadow-lg hover:-translate-y-[0.5px] active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <LogIn size={16} />
                Login
              </button>
            )}
          </div>

          {/* Mobile: search + menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => router.push("/search")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:bg-slate-50 hover:text-slate-900"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-0 right-0 top-[68px] z-50 mx-auto w-full max-w-7xl px-4 lg:hidden"
            >
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 supports-[backdrop-filter]:bg-white/90">
                <div className="p-4">
                  <form onSubmit={handleSearch}>
                    <div className="relative group">
                      <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={searchText}
                        className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 focus:bg-white py-3 pl-11 pr-4 text-sm shadow-inner transition-all duration-300 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search for companies or roles..."
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      Search
                    </button>
                  </form>
                </div>

                <div className="border-t border-slate-100 p-2">
                  {navItems.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={[
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all active:scale-[0.98]",
                        isActive(href)
                          ? "bg-indigo-50/80 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      ].join(" ")}
                    >
                      <Icon size={18} className={isActive(href) ? "text-blue-600" : "text-slate-400"} />
                      {label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-slate-100 p-3">
                  {session ? (
                    <button
                      onClick={handleLogout}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 py-3 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-200"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      <LogIn size={16} />
                      Login
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
