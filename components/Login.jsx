"use client";

import { useCallback, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Login = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const saveAttempted = useRef(false);

  // Function to save user data
  const saveUserData = useCallback(async (userData) => {
    console.log("🚀 Attempting to save user data:", userData);
    
    try {
      const response = await fetch("/api/saveUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Server returned error:", errorData);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ User data saved successfully:", result);
      return result;
    } catch (error) {
      console.error("❌ Error saving user data:", error);
      throw error;
    }
  }, []);

  // Handle Google sign in
  const handleGoogleSignIn = useCallback(async () => {
    console.log("🔑 Starting Google sign in process");
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: window.location.href,
      });
      
      console.log("📡 Sign in result:", result);
      
      if (result?.error) {
        console.error("❌ Sign in error:", result.error);
      }
    } catch (error) {
      console.error("❌ Sign in failed:", error);
    }
  }, []);

  useEffect(() => {
    console.log("🔄 Session status:", status);
    console.log("👤 Current session:", session);
    console.log("🎯 Save attempted:", saveAttempted.current);

    const saveUser = async () => {
      if (session?.user && !saveAttempted.current) {
        console.log("🎯 Starting save user process");
        saveAttempted.current = true;
        
        try {
          const { email, name, image } = session.user;
          await saveUserData({
            gmail: email,
            name,
            image,
          });
          
          if (window.location.pathname === "/login") {
            console.log("🚪 Redirecting to home");
            router.push("/feed");
          }
        } catch (error) {
          console.error("❌ Failed to save user:", error);
          saveAttempted.current = false;
        }
      }
    };

    if (status === "authenticated") {
      saveUser();
    }

    return () => {
      console.log("♻️ Cleanup running, save attempted:", saveAttempted.current);
    };
  }, [session, status, router, saveUserData]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] px-4 sm:p-8">
      <div className="w-full max-w-[320px] sm:max-w-md rounded-2xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl sm:p-8">
        {session ? (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            <div className="text-center space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-sky-300 bg-clip-text text-transparent">
                Welcome
              </h2>
              <p className="text-sm sm:text-base text-slate-300 px-2 sm:px-4">
                Sign in to share and view interview experiences
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="group relative w-full bg-white text-slate-700 rounded-xl py-2.5 sm:py-3 px-4 sm:px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative flex items-center justify-center space-x-2 sm:space-x-3">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-medium text-sm sm:text-base whitespace-nowrap">
                  Continue with Google
                </span>
              </div>
            </button>

            <div className="w-full flex items-center justify-center space-x-2">
              <div className="h-px w-12 sm:w-16 bg-slate-600"></div>
              <span className="text-xs sm:text-sm text-slate-400 whitespace-nowrap">
                Protected by Google
              </span>
              <div className="h-px w-12 sm:w-16 bg-slate-600"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
