"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  User,
  LogIn,
  Menu,
  X,
  List,
  Flame,
  Building2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import logo from "../public/app_icon.png";
import NotificationsMenu from "./NotificationsMenu";
import { useAuthModal } from "./AuthModalProvider";
import ThemeToggle from "./ThemeToggle";
import { requestJson } from "@/lib/client-api";

export default function Navbar({ showThemeToggle = true }) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const desktopNotificationsRef = useRef(null);
  const mobileNotificationsRef = useRef(null);

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
      const json = await requestJson(res, {}, { notifications: [], unreadCount: 0 });

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
    // Only listen while open; this used to fire setNotificationsOpen(false) on
    // every mousedown anywhere on the page.
    if (!notificationsOpen) return undefined;

    const handleClickOutside = (event) => {
      const clickedDesktopMenu = desktopNotificationsRef.current?.contains(event.target);
      const clickedMobileMenu = mobileNotificationsRef.current?.contains(event.target);

      if (!clickedDesktopMenu && !clickedMobileMenu) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen]);

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

  // Toggle the solid header background once the page is scrolled.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
          "fixed top-0 z-50 w-full transition-colors duration-200",
          isScrolled
            ? "border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90"
            : "border-b border-transparent",
        ].join(" ")}
      >
        <div className="relative mx-auto flex w-full items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-4 lg:px-6 xl:gap-6 xl:px-8 2xl:max-w-[1520px]">
          {/* Left: Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              prefetch={true}
              className="group flex items-center gap-2 font-semibold tracking-tight text-slate-900 transition active:scale-95 dark:text-slate-100"
            >
              <Image
                src={logo}
                alt="The Interview Room logo"
                width={34}
                height={34}
                priority
                className="object-contain"
              />
              <span className="hidden text-[15px] font-bold min-[400px]:inline sm:text-lg xl:text-xl">
                the<span className="text-blue-600 dark:text-blue-500">Interview</span>Room
              </span>
            </Link>
          </div>

          {/* Center: Nav Links */}
          <nav className="hidden items-center gap-1 lg:flex lg:justify-self-center">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={[
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden items-center gap-2 lg:ml-auto lg:flex lg:justify-self-end xl:gap-3">
            <ThemeToggle />

            <div className="flex items-center gap-2">
              <div ref={desktopNotificationsRef} className="flex items-center gap-2">
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
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/50 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  >
                    Login
                  </button>
                )}
              </div>

              <Link
                href="/post"
                prefetch={true}
                className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                Share Experience
              </Link>
            </div>
          </div>

          {/* Mobile: Menu and actions */}
          <div className="flex items-center gap-1.5 lg:hidden min-[400px]:gap-2">
            <div className="flex items-center gap-1.5 min-[400px]:gap-2">
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
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white/85 text-slate-600 shadow-sm backdrop-blur transition-all active:scale-95 hover:-translate-y-[1px] hover:border-blue-300/60 hover:bg-blue-50/70 hover:text-blue-700 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-slate-800 dark:hover:text-blue-300 sm:h-10 sm:w-10"
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
              className="fixed left-0 right-0 top-[calc(env(safe-area-inset-top)+66px)] z-50 mx-auto w-full max-w-2xl px-3 min-[400px]:px-4 sm:top-[calc(env(safe-area-inset-top)+72px)] sm:px-5 md:top-[calc(env(safe-area-inset-top)+78px)] lg:hidden"
            >
              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_22px_44px_rgba(15,23,42,0.16)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-[0_24px_50px_rgba(2,6,23,0.7)] dark:supports-[backdrop-filter]:bg-slate-950/90">
                <div className="p-3 sm:p-4">
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
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
                  </div>
                  <Link
                    href="/post"
                    className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    Share Experience
                  </Link>
                </div>

                <div className="border-t border-slate-100 p-3 sm:p-4 dark:border-slate-800">
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400/40"
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
