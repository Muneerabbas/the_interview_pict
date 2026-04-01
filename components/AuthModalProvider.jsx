"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Login from "@/components/Login";

const AuthModalContext = createContext({
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({
      openAuthModal: () => setIsOpen(true),
      closeAuthModal: () => setIsOpen(false),
    }),
    []
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {isOpen ? (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/55 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              aria-label="Close login popup"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            >
              ×
            </button>
            <Login />
          </div>
        </div>
      ) : null}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
