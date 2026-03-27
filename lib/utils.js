import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function resolveProfileImage(data) {
  if (!data) return null;
  // Check all possible fields in order of priority
  const candidates = [
    data.profile_pic,
    data.image,
    data.profilePic_Url,
    data.profilePic,
    data.user?.image,
    data.user?.profile_pic
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
  const raw = data.name || data.displayName || data.user?.name || "";
  if (typeof raw === 'string') {
    const clean = raw.replace(/"/g, "").trim();
    if (clean && clean !== "null" && clean !== "undefined") {
      return clean;
    }
  }
  return "Anonymous Candidate";
}
