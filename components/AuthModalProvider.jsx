"use client";

import { createContext, useContext, useMemo, useState } from "react";
import Login from "@/components/Login";
import Modal from "@/components/ui/Modal";

const AuthModalContext = createContext({
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

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
      {/* Shared Modal: Escape, outside click, scroll lock, focus trap and focus
          restore in one place. This one had the first three and neither of the
          last two. */}
      <Modal open={isOpen} onClose={() => setIsOpen(false)} size="md">
        <Login compact />
      </Modal>
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
