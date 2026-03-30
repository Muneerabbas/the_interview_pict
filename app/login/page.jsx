"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Login from "@/components/Login";
import Navbar from "@/components/Navbar";

const LoginPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to /feed if the user is already authenticated
    if (status === "authenticated") {
      router.push("/feed");
    }
  }, [status, router]);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar showThemeToggle />
      <div className="fixed inset-0 z-40 flex items-center justify-center pt-16 md:pt-20">
        <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm dark:bg-slate-950/80" />
        <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900 dark:shadow-[0_20px_40px_rgba(2,6,23,0.65)]">
          <Login />
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
