import { companySlugFromName } from "./companySlug.js";

/**
 * Placement rows and the companies collection name the same employer
 * differently, so a raw slug comparison misses most of the overlap:
 *
 *   "Flextrade 2"        repeat drives are numbered
 *   "eQ Technologic (SDE)"  role split in parentheses
 *   "Dell Technologies"  vs the company page's "Dell"
 *   "miniOrange"         vs "Mini Orange"
 *
 * These helpers produce two keys per name: an exact slug, and a looser "squash"
 * key that survives spacing and the usual corporate suffixes. The squash key is
 * only ever used when it resolves to exactly one company (see buildCompanyIndex),
 * because a wrong link is worse than no link.
 */

/** Drop repeat-drive numbering and role qualifiers, then slugify. */
export function placementCompanySlug(name) {
  const base = String(name ?? "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s+\d+$/, "")
    .trim();
  return companySlugFromName(base);
}

const SUFFIXES =
  /(?:pvtltd|pvt|ltd|llc|llp|inc|corp|co|india|technologies|technologie|technology|tech|systems|system|software|softwares|solutions|solution|services|labs|lab|group|s)$/;

/** Lowercase alphanumerics with one trailing corporate suffix removed. */
export function squashCompanyKey(name) {
  let key = placementCompanySlug(name).replace(/-/g, "");
  if (!key) return "";
  const stripped = key.replace(SUFFIXES, "");
  // Never squash a name down to nothing or to a single letter -- "Co" and "S"
  // would collide with half the directory.
  return stripped.length >= 3 ? stripped : key;
}

/**
 * Build the lookup used to decide whether a placement row links out.
 * `companies` is [{ name, slug }] straight from the companies collection.
 */
export function buildCompanyIndex(companies = []) {
  const bySlug = new Map();
  const bySquash = new Map();

  for (const company of companies) {
    if (!company?.slug) continue;
    bySlug.set(company.slug, company.slug);

    const key = squashCompanyKey(company.name || company.slug);
    if (!key) continue;
    // Ambiguous keys are poisoned rather than resolved arbitrarily: if two
    // companies squash the same, neither is a safe automatic match.
    bySquash.set(key, bySquash.has(key) ? null : company.slug);
  }

  return { bySlug, bySquash };
}

/** The company-page slug for a placement row, or null when there is no page. */
export function resolveCompanySlug(name, index) {
  if (!index) return null;
  const slug = placementCompanySlug(name);
  if (index.bySlug.has(slug)) return slug;
  return index.bySquash.get(squashCompanyKey(name)) || null;
}
