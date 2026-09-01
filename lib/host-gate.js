/**
 * Both pict.live and theinterviewroom.in resolve to this same deployment.
 * Placement statistics are a pict.live-only surface, so every entry point that
 * decides whether to show them -- the page, middleware, the Navbar, the test --
 * routes through here rather than re-implementing host parsing four times.
 *
 * Deliberately free of next/* imports so it runs in a server component, in edge
 * middleware, in the browser, and in a plain node script.
 */

const PLACEMENT_HOSTS = new Set(["pict.live"]);
const DEV_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

/** Lowercase, take the first entry of a list, drop the port, drop a www. prefix. */
export function normalizeHost(value) {
  let host = String(value || "").trim().toLowerCase();
  if (!host) return "";

  // x-forwarded-host can be a comma-separated chain when several proxies add to it.
  host = host.split(",")[0].trim();

  if (host.startsWith("[")) {
    // IPv6 literal, e.g. [::1]:3000 -- the colons are part of the address.
    const close = host.indexOf("]");
    host = close === -1 ? host : host.slice(0, close + 1);
  } else {
    host = host.split(":")[0];
  }

  return host.startsWith("www.") ? host.slice(4) : host;
}

/**
 * Exact Set membership, never substring matching: `pict.live.evil.com` contains
 * "pict.live" and must not pass.
 *
 * allowDev lets localhost stand in for pict.live during `npm run dev`, since
 * there is no local DNS for it. It is off in production, so the bypass can never
 * open the gate on a deployed build.
 */
export function isPlacementHost(
  value,
  { allowDev = process.env.NODE_ENV !== "production" } = {}
) {
  const host = normalizeHost(value);
  if (!host) return false;
  if (PLACEMENT_HOSTS.has(host)) return true;
  return allowDev && DEV_HOSTS.has(host);
}

/**
 * Netlify's edge rewrites Host to an internal value and preserves the original
 * in x-forwarded-host, so that header has to win. Takes a getter rather than a
 * Headers object because middleware and next/headers expose different shapes.
 */
export function hostFromHeaders(get) {
  return get("x-forwarded-host") || get("host") || "";
}
