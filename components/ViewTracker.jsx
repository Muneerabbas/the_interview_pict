"use client";

import { useEffect, useRef } from "react";

/**
 * Records one view per mount.
 *
 * The two previous copies kept the "already sent" flag in state AND listed it in
 * the effect's dependency array, with no guard set before the request went out --
 * so StrictMode (and any fast re-render) fired the increment twice.
 */
export default function ViewTracker({ endpoint, payload }) {
  const key = JSON.stringify(payload ?? null);
  const sentFor = useRef(null);

  useEffect(() => {
    const value = Object.values(payload || {})[0];
    if (!value || sentFor.current === key) return undefined;

    // Claim it before awaiting, or a second render slips through.
    sentFor.current = key;

    const controller = new AbortController();

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).catch((error) => {
      if (error.name === "AbortError") return;
      console.error("Error sending view count:", error);
    });

    return () => controller.abort();
  }, [endpoint, key, payload]);

  return null;
}
