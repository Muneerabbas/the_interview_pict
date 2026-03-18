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

  const texts = ["Company 🏢", "Batch 🎓", "Role 💼", "Person 👤"];
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
        className="fixed top-0 w-full z-50 border-b border-black/5 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-slate-900"
          >
            <Image src={logo} alt="theInterview Logo" width={34} height={34} priority />
            <span className="text-lg sm:text-xl">
              the<span className="text-blue-600">Interview</span>
            </span>
          </Link>

          {/* Desktop: search + links */}
          <div className="hidden lg:flex flex-1 items-center justify-center px-8">
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={searchText}
                  className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-28 text-sm shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for"
                />

                {!searchText && (
                  <div className="pointer-events-none absolute left-[112px] top-1/2 -translate-y-1/2 overflow-hidden h-5 w-28">
                    <AnimatePresence mode="sync">
                      <motion.div
                        key={index}
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="absolute w-full text-sm font-medium text-blue-600"
                      >
                        {texts[index]}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8B77F9] focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                  "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                  isActive(href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className={isActive(href) ? "text-blue-700" : "text-slate-500 group-hover:text-slate-700"}
                />
                <span>{label}</span>
              </Link>
            ))}

            <div className="ml-2 h-8 w-px bg-slate-200" />

            {session ? (
              <button
                onClick={handleLogout}
                className="ml-2 inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-100"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="ml-2 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <LogIn size={18} />
                Login
              </button>
            )}
          </div>

          {/* Mobile: search + menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => router.push("/search")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="fixed left-0 right-0 top-[64px] z-50 mx-auto w-full max-w-7xl px-4 lg:hidden"
            >
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="p-4">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="text"
                        value={searchText}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search for"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-3 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8B77F9] focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      Search
                    </button>
                  </form>
                </div>

                <div className="border-t border-slate-200 p-2">
                  {navItems.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={[
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        isActive(href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-800 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      <Icon size={18} className={isActive(href) ? "text-blue-700" : "text-slate-500"} />
                      {label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-slate-200 p-3">
                  {session ? (
                    <button
                      onClick={handleLogout}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <LogIn size={18} />
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