import { headers } from "next/headers";

export async function getServerOrigin() {
  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host");
  const host = forwardedHost || h.get("host");
  const forwardedProto = h.get("x-forwarded-proto");

  if (host) {
    const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

