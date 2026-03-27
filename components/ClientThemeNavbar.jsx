"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function ClientThemeNavbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeHydrated, setThemeHydrated] = useState(false);

  useEffect(() => {
    const storedCompaniesTheme = window.localStorage.getItem("companies-theme");
    const storedGlobalTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDarkMode = storedCompaniesTheme
      ? storedCompaniesTheme === "dark"
      : storedGlobalTheme
        ? storedGlobalTheme === "dark"
        : prefersDark;

    setIsDarkMode(initialDarkMode);
    setThemeHydrated(true);
  }, []);

  useEffect(() => {
    if (!themeHydrated) return;
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("companies-theme", isDarkMode ? "dark" : "light");
    window.localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode, themeHydrated]);

  return <Navbar showThemeToggle isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode((prev) => !prev)} />;
}
