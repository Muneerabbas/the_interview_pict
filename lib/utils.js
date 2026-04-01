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
