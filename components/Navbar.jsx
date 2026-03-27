"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Building2,
  Moon,
  Sun,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import logo from "../public/icon.svg";
import NotificationsMenu from "./NotificationsMenu";
import { useAuthModal } from "./AuthModalProvider";

export default function Navbar({ showThemeToggle = false, isDarkMode = false, onToggleDarkMode }) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [searchText, setSearchText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const desktopNotificationsRef = useRef(null);
  const mobileNotificationsRef = useRef(null);

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
    setNotificationsOpen(false);
  }, [pathname]);

  const loadNotifications = useCallback(async () => {
    if (!session?.user?.email) {
      setNotifications([]);
      setUnreadNotifications(0);
      return;
    }

    setNotificationsLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to fetch notifications");
      }

      setNotifications(Array.isArray(json.notifications) ? json.notifications : []);
      setUnreadNotifications(Number(json.unreadCount) || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email) {
      setNotifications([]);
      setUnreadNotifications(0);
      setNotificationsOpen(false);
      return undefined;
    }

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(intervalId);
  }, [loadNotifications, session?.user?.email]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedDesktopMenu = desktopNotificationsRef.current?.contains(event.target);
      const clickedMobileMenu = mobileNotificationsRef.current?.contains(event.target);

      if (!clickedDesktopMenu && !clickedMobileMenu) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearAllSessionData = () => {
    document.cookie.split(";").forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=; max-age=0; path=/`;
    });
    sessionStorage.clear();
    // Preserve UI preferences like theme while clearing auth/session state.
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

  const handleThemeToggle = () => {
    if (typeof onToggleDarkMode === "function") {
      onToggleDarkMode();
    }
  };

  const handleNotificationsToggle = useCallback(async () => {
    if (!session?.user) {
      openAuthModal();
      return;
    }

    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);

    if (nextOpen && unreadNotifications > 0) {
      setUnreadNotifications(0);
      try {
        const res = await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to mark notifications as read");
        }
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
        loadNotifications();
      }
    }
  }, [loadNotifications, notificationsOpen, openAuthModal, session?.user, unreadNotifications]);

  const navItems = useMemo(
    () => [
      { href: "/", label: "Home", Icon: Home },
      { href: "/companies", label: "Companies", Icon: Building2 },
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
        className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/65 dark:border-slate-800/80 dark:bg-slate-950/85 dark:shadow-[0_12px_36px_rgba(2,6,23,0.65)] dark:supports-[backdrop-filter]:bg-slate-950/65"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          {/* Brand */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-semibold tracking-tight text-slate-900 transition-all active:scale-95 dark:text-slate-100"
          >
            <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-white to-slate-50 p-0.5 shadow-[0_6px_18px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5 transition-transform group-hover:scale-105 dark:from-slate-900 dark:to-slate-800 dark:ring-slate-100/10 dark:shadow-[0_8px_22px_rgba(2,6,23,0.55)]">
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500 dark:group-focus-within:text-cyan-300"
                />
                <input
                  type="text"
                  value={searchText}
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/90 py-2.5 pl-11 pr-28 text-sm text-slate-700 shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700/90 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/15"
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
                        className="absolute w-full text-sm font-medium text-blue-500 dark:text-cyan-300"
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
          <div className="hidden items-center gap-1.5 rounded-2xl border border-slate-200/70 bg-white/70 p-1.5 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/80 dark:shadow-[0_8px_20px_rgba(2,6,23,0.55)] lg:flex">
            {navItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={[
                  "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all active:scale-95",
                  isActive(href)
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm dark:from-cyan-950/45 dark:to-blue-950/45 dark:text-cyan-300"
                    : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-slate-100",
                ].join(" ")
                }
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-200 ${isActive(href) ? "text-blue-600 dark:text-cyan-300" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-200"}`}
                />
                <span>{label}</span>
              </Link>
            ))}

            {session ? (
              <div ref={desktopNotificationsRef}>
                <NotificationsMenu
                  isOpen={notificationsOpen}
                  isLoading={notificationsLoading}
                  unreadCount={unreadNotifications}
                  notifications={notifications}
                  onToggle={handleNotificationsToggle}
                  onClose={() => setNotificationsOpen(false)}
                  buttonClassName="relative ml-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-[0.5px] hover:border-blue-300/50 hover:text-blue-700 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                />
              </div>
            ) : null}

            {showThemeToggle && (
              <button
                onClick={handleThemeToggle}
                aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-[0.5px] hover:border-cyan-300/50 hover:text-cyan-700 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
                type="button"
              >
                {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
              </button>
            )}

            <div className="ml-1 h-8 w-px bg-slate-200/80 dark:bg-slate-700/80" />

            {session ? (
              <button
                onClick={handleLogout}
                className="ml-1 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition-all hover:-translate-y-[0.5px] hover:bg-rose-100 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-rose-500/40 dark:bg-rose-950/35 dark:text-rose-300 dark:hover:bg-rose-950/50 dark:focus:ring-rose-500/35"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="ml-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition-all hover:-translate-y-[0.5px] hover:from-slate-800 hover:to-slate-700 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:from-cyan-700 dark:to-blue-700 dark:shadow-cyan-950/45 dark:hover:from-cyan-600 dark:hover:to-blue-600 dark:focus:ring-cyan-400/40"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            {showThemeToggle && (
              <button
                onClick={handleThemeToggle}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                type="button"
              >
                {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              </button>
            )}
            {session ? (
              <div ref={mobileNotificationsRef}>
                <NotificationsMenu
                  isOpen={notificationsOpen}
                  isLoading={notificationsLoading}
                  unreadCount={unreadNotifications}
                  notifications={notifications}
                  onToggle={handleNotificationsToggle}
                  onClose={() => setNotificationsOpen(false)}
                  panelClassName="right-0"
                  buttonClassName="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                />
              </div>
            ) : null}
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] dark:bg-black/50"
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-0 right-0 top-[68px] z-50 mx-auto w-full max-w-7xl px-4 lg:hidden"
            >
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_22px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-[0_24px_50px_rgba(2,6,23,0.7)] dark:supports-[backdrop-filter]:bg-slate-950/90">
                <div className="p-4">
                  <form onSubmit={handleSearch}>
                    <div className="relative group">
                      <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors dark:text-slate-500 dark:group-focus-within:text-cyan-300"
                      />
                      <input
                        type="text"
                        value={searchText}
                        className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-700 shadow-inner outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/15"
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

                <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                  {navItems.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={[
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all active:scale-[0.98]",
                        isActive(href)
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-cyan-950/45 dark:to-blue-950/45 dark:text-cyan-300"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                      ].join(" ")}
                    >
                      <Icon size={18} className={isActive(href) ? "text-blue-600 dark:text-cyan-300" : "text-slate-400 dark:text-slate-500"} />
                      {label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-slate-100 p-3 dark:border-slate-800">
                  {session ? (
                    <button
                      onClick={handleLogout}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-rose-500/40 dark:bg-rose-950/35 dark:text-rose-300 dark:hover:bg-rose-950/55 dark:focus:ring-rose-500/35"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition-all hover:from-slate-800 hover:to-slate-700 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-300 dark:from-cyan-700 dark:to-blue-700 dark:shadow-cyan-950/45 dark:hover:from-cyan-600 dark:hover:to-blue-600 dark:focus:ring-cyan-400/40"
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
