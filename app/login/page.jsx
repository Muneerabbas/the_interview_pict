"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Login from "@/components/Login";

const LoginPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to /home if the user is already authenticated
    if (status === "authenticated") {
      router.push("/home");
    }
  }, [status, router]);

  return (
    <main className="min-h-screen bg-[#1D1D1D]">
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-[#F0F2F5]/80 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <Login />
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
