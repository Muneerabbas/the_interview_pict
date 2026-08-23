/** Same slug rules as /api/postCompanies — used by seed script and API. */
export function companySlugFromName(name) {
  // Callers pass free text straight off a post document; an undefined here used to
  // take down the whole card tree.
  return String(name ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Company names are stored as free text on each post, so the same company exists
 * as "Cutshort" and "CutShort". An exact match silently returned zero results for
 * one of the two casings, which is why some companies could never be filtered.
 */
export function companyNameFilter(name) {
  const escaped = String(name ?? "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return { $regex: `^${escaped}$`, $options: "i" };
}
