"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { requestJson } from "@/lib/client-api";
import Alert from "@/components/ui/Alert";

const Login = ({ compact = false }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const saveAttempted = useRef(false);
  const [authError, setAuthError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  // Upserts the signed-in user. Identity is read from the session server-side,
  // so there is no body to send.
  const saveUserData = useCallback(async () => {
    const response = await fetch("/api/saveUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return requestJson(response, {}, {});
  }, []);

  // Handle Google sign in
  const handleGoogleSignIn = useCallback(async () => {
    setAuthError("");
    setSigningIn(true);
    try {
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: window.location.href,
      });

      // Previously these failures were console-only, so a blocked popup made the
      // button look like it simply did nothing, forever.
      if (result?.error) {
        setAuthError("Google sign-in failed. Please try again.");
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      setAuthError("Could not reach Google. Check your connection and try again.");
    } finally {
      setSigningIn(false);
    }
  }, []);

  useEffect(() => {
    // No logging of the session object here: it carries the user's email, name
    // and avatar straight into the browser console in production.
    const saveUser = async () => {
      if (!session?.user || saveAttempted.current) return;
      saveAttempted.current = true;

      try {
        await saveUserData();
        if (window.location.pathname === "/login") {
          router.push("/feed");
        }
      } catch (error) {
        console.error("Failed to save user:", error);
        saveAttempted.current = false;
      }
    };

    if (status === "authenticated") {
      saveUser();
    }
  }, [session, status, router, saveUserData]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin dark:border-blue-300" />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full">
        {session ? (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin dark:border-blue-300" />
          </div>
        ) : (
          <div className={`flex flex-col items-center ${compact ? "space-y-6" : "space-y-6 sm:space-y-8"}`}>
            <div className="text-center space-y-2 sm:space-y-3">
              <h2 id={compact ? "auth-modal-title" : undefined} className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
                Welcome
              </h2>
              <p className="px-2 text-sm text-slate-500 dark:text-slate-400 sm:px-4 sm:text-base">
                Sign in to share and view interview experiences
              </p>
            </div>

            <Alert tone="error" className="w-full">{authError}</Alert>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="group relative w-full disabled:opacity-70 rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 sm:px-6"
            >
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
                  {signingIn ? "Connecting..." : "Continue with Google"}
                </span>
              </div>
            </button>

            <div className="flex w-full items-center justify-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
              <span className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-500 sm:text-sm">
                Protected by Google
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
