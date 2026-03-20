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
        className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/65"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          {/* Brand */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-semibold tracking-tight text-slate-900 transition-all active:scale-95"
          >
            <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-white to-slate-50 p-0.5 shadow-[0_6px_18px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5 transition-transform group-hover:scale-105">
              <Image src={logo} alt="theInterview Logo" width={34} height={34} priority className="rounded-[10px]" />
            </div>
            <span className="text-lg font-bold sm:text-xl">
              the<span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Interview</span>
            </span>
          </Link>

          {/* Desktop: search + links */}
          <div className="hidden flex-1 items-center justify-center px-8 lg:flex">
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="group relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500"
                />
                <input
                  type="text"
                  value={searchText}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/90 py-2.5 pl-11 pr-28 text-sm shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all duration-300 hover:-translate-y-[0.5px] hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/35 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Desktop: nav items + auth */}
          <div className="hidden items-center gap-1.5 rounded-2xl border border-slate-200/70 bg-white/70 p-1.5 shadow-sm backdrop-blur-sm lg:flex">
            {navItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={[
                  "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all active:scale-95",
                  isActive(href)
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900",
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

            <div className="ml-1 h-8 w-px bg-slate-200/80" />

            {session ? (
              <button
                onClick={handleLogout}
                className="ml-1 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition-all hover:-translate-y-[0.5px] hover:bg-rose-100 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="ml-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition-all hover:-translate-y-[0.5px] hover:from-slate-800 hover:to-slate-700 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-300"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:bg-slate-50 hover:text-slate-900"
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
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_22px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90">
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
                        className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 py-3 pl-11 pr-4 text-sm shadow-inner outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search for companies or roles..."
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all active:scale-[0.98]",
                        isActive(href)
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-200"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition-all hover:from-slate-800 hover:to-slate-700 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-300"
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
