/** Same slug rules as /api/postCompanies — used by seed script and API. */
export function companySlugFromName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
