import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function resolveProfileImage(data) {
  if (!data) return null;
  // Prioritize the merged authentic User/Author data over stale post document fields
  const candidates = [
    data.author?.image,
    data.author?.profile_pic,
    data.author?.profilePic_Url,
    data.author?.profilePic,
    data.user?.image,
    data.user?.profile_pic,
    data.user?.profilePic_Url,
    data.user?.profilePic,
    data.image,
    data.profile_pic,
    data.profilePic_Url,
    data.profilePic,
  ];

  for (const candy of candidates) {
    if (typeof candy === 'string') {
      const clean = candy.replace(/"/g, "").trim();
      if (clean && clean !== "null" && clean !== "undefined" && !clean.includes("placeholder")) {
        return clean;
      }
    }
  }
  return null;
}

export function resolveProfileName(data) {
  if (!data) return "Anonymous Candidate";
  // Prioritize live author/user identity
  const raw = data.author?.name || data.author?.displayName || data.user?.name || data.user?.displayName || data.name || data.displayName || "";
  if (typeof raw === 'string') {
    const clean = raw.replace(/"/g, "").trim();
    if (clean && clean !== "null" && clean !== "undefined") {
      return clean;
    }
  }
  return "Anonymous Candidate";
}

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape a value before interpolating it into an HTML string (e-mail bodies, etc). */
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/**
 * Only http(s) links are safe to put in an href -- `javascript:` and `data:` URLs
 * become stored XSS the moment another user views the profile.
 */
export function safeExternalUrl(url) {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}
