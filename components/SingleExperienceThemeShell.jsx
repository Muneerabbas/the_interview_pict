"use client";


import Navbar from "@/components/Navbar";

export default function SingleExperienceThemeShell({ children }) {

  return (
    <>
      <Navbar showThemeToggle />
      {children}
    </>
  );
}
