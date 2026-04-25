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
  Flame,
  Info,
  Building2,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import logo from "../public/app_icon.png";
import NotificationsMenu from "./NotificationsMenu";
import { useAuthModal } from "./AuthModalProvider";
import ThemeToggle from "./ThemeToggle";

import { useTheme } from "next-themes";

export default function Navbar({ showThemeToggle = false }) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [searchText, setSearchText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDeepScrolled, setIsDeepScrolled] = useState(false);
  const desktopNotificationsRef = useRef(null);
  const mobileNotificationsRef = useRef(null);

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    let intervalId = null;

    const setupPolling = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      if (document.visibilityState === "visible") {
        intervalId = window.setInterval(loadNotifications, 60000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadNotifications();
      }
      setupPolling();
    };

    setupPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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

  // Scroll handler for premium dynamics
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setIsDeepScrolled(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = useMemo(
    () => [
      { href: "/", label: "Home", Icon: Home },
      { href: "/feed", label: "Interviews", Icon: List },
      { href: "/tales", label: "Tales", Icon: Flame },
      { href: "/companies", label: "Companies", Icon: Building2 },
    ],
    []
  );

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <>
      <header
        className={[
          "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out",
          isScrolled
            ? "border-b border-slate-200/70 bg-white/85 shadow-md backdrop-blur-2xl supports-[backdrop-filter]:bg-white/65 dark:border-slate-800/80 dark:bg-slate-950/85 dark:shadow-[0_12px_36px_rgba(2,6,23,0.65)] dark:supports-[backdrop-filter]:bg-slate-950/65"
            : "border-b-transparent bg-transparent backdrop-blur-none",
        ].join(" ")}
      >
        <div
          className={[
            "relative mx-auto flex w-full items-center justify-between transition-all duration-300 ease-in-out",
            isScrolled
              ? "px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8 xl:px-10"
              : "px-4 py-6 sm:px-6 sm:py-7 lg:px-8 xl:px-10",
          ].join(" ")}
        >
          {/* Left: Brand (Extreme Left) */}
          <div className="flex items-center">
            <Link
              href="/"
              className={[
                "group flex items-center gap-2.5 font-semibold tracking-tight text-slate-900 transition-all active:scale-95 dark:text-slate-100",
                isScrolled ? "scale-95" : "scale-100",
              ].join(" ")}
              prefetch={true}
            >
              <div className="relative flex items-center justify-center transition-transform group-hover:scale-105">
                <Image
                  src={logo}
                  alt="theInterview Logo"
                  width={isScrolled ? 42 : 46}
                  height={isScrolled ? 42 : 46}
                  priority
                  className="object-contain transition-all duration-300"
                />
              </div>
              <span className="hidden text-base font-bold min-[360px]:inline sm:text-xl">
                the<span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Interview</span><span>Room</span>
              </span>
            </Link>
            <div
              className={[
                "mx-3 hidden h-6 w-px bg-slate-200 transition-all duration-300 dark:bg-slate-800 lg:block",
                isScrolled ? "h-5 opacity-60" : "h-6 opacity-100",
              ].join(" ")}
            />
          </div>

          {/* Absolute Center: Nav Items (Perfectly Centered) */}
          <div
            className={[
              "absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex transition-all duration-300",
              isDeepScrolled ? "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto" : "opacity-100",
            ].join(" ")}
          >
            <div className="flex items-center gap-1 rounded-2xl border border-slate-200/70 bg-white/70 p-1.5 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/80">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "group flex items-center gap-1.5 rounded-[14px] px-4 py-1.5 text-[15px] font-bold transition-all active:scale-95",
                    isActive(href)
                      ? "bg-blue-100 text-blue-700 shadow-sm border border-blue-200/50 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/40"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                  ].join(" ")}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Search & Actions */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* Search Bar */}
            <div className="min-w-0 max-w-[260px] xl:max-w-md">
              <form onSubmit={handleSearch}>
                <div className="group relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500 dark:group-focus-within:text-blue-400"
                  />
                  <input
                    type="text"
                    value={searchText}
                    className="w-full rounded-2xl border border-slate-200/90 bg-white/95 py-2.5 pl-11 pr-12 text-[14px] font-medium text-slate-700 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/15"
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder=""
                  />

                  {!searchText && (
                    <div className="pointer-events-none absolute inset-y-0 left-10 right-10 flex items-center gap-1.5 overflow-hidden">
                      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">Search</span>
                      <div className="relative h-5 min-w-0 flex-1 overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={index}
                            initial={{ y: 14, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -14, opacity: 0 }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                            className="absolute inset-0 truncate text-xs font-medium text-blue-500 dark:text-blue-400"
                          >
                            {texts[index]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <Search size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </div>

            <ThemeToggle />

            <div className="flex items-center gap-2.5">
              <div ref={desktopNotificationsRef} className="flex items-center gap-2.5">
                {session ? (
                  <>
                    <NotificationsMenu
                      isOpen={notificationsOpen}
                      isLoading={notificationsLoading}
                      unreadCount={unreadNotifications}
                      notifications={notifications}
                      onToggle={handleNotificationsToggle}
                      onClose={() => setNotificationsOpen(false)}
                      buttonClassName="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-[1px] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                    <Link
                      href="/profile"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <User size={18} />
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/50 px-5 text-[14px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  >
                    Login
                  </button>
                )}
              </div>

              <Link
                href="/post"
                prefetch={true}
                className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 px-6 text-[14px] font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98]"
              >
                Share Experience
              </Link>
            </div>
          </div>

          {/* Mobile: Search + Menu + CTA */}
          <div className="flex items-center gap-1.5 lg:hidden sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {showThemeToggle && <ThemeToggle />}
              {session && (
                <div ref={mobileNotificationsRef}>
                  <NotificationsMenu
                    isOpen={notificationsOpen}
                    isLoading={notificationsLoading}
                    unreadCount={unreadNotifications}
                    notifications={notifications}
                    onToggle={handleNotificationsToggle}
                    onClose={() => setNotificationsOpen(false)}
                    buttonClassName="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:border-blue-300/60 hover:bg-blue-50/70 hover:text-blue-700 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-300 dark:hover:border-blue-500/45 dark:hover:bg-slate-800 dark:hover:text-blue-300 sm:h-10 sm:w-10"
                  />
                </div>
              )}
            </div>



            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:-translate-y-[1px] hover:border-blue-300/60 hover:bg-blue-50/70 hover:text-blue-700 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-300 dark:hover:border-cyan-500/45 dark:hover:bg-slate-800 dark:hover:text-cyan-300 sm:h-10 sm:w-10"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

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
              className="fixed left-0 right-0 top-[62px] z-50 mx-auto w-full max-w-7xl px-4 sm:top-[68px] lg:hidden"
            >
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_22px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-[0_24px_50px_rgba(2,6,23,0.7)] dark:supports-[backdrop-filter]:bg-slate-950/90">
                <div className="p-4">
                  <form onSubmit={handleSearch}>
                    <div className="relative group">
                      <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors dark:text-slate-500 dark:group-focus-within:text-blue-400"
                      />
                      <input
                        type="text"
                        value={searchText}
                        className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 py-2.5 pl-11 pr-4 text-sm text-slate-700 shadow-inner outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/15"
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search for companies or roles..."
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-colors hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                          ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                      ].join(" ")}
                    >
                      <Icon size={18} className={isActive(href) ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"} />
                      {label}
                    </Link>
                  ))}
                  <Link
                    href="/post"
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-colors hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Share Experience
                  </Link>
                </div>

                <div className="border-t border-slate-100 p-3 dark:border-slate-800">
                  {session ? (
                    <Link
                      href="/profile"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-slate-600/45"
                    >
                      <User size={16} />
                      View Profile
                    </Link>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition-all hover:from-slate-800 hover:to-slate-700 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-300 dark:from-blue-700 dark:to-indigo-700 dark:shadow-blue-950/45 dark:hover:from-blue-600 dark:hover:to-indigo-600 dark:focus:ring-blue-400/40"
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
