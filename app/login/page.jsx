"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Login from "@/components/Login";

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
    <main className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80" />
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl p-8 max-w-md w-full mx-4 dark:bg-slate-900 dark:border-slate-800">
          <Login />
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
