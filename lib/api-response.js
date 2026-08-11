import { NextResponse } from "next/server";

export function jsonError(error, fallback = "Request failed", status = 500) {
  const message = error?.message || "";
  const isDatabaseError = /Mongo|TLS|SSL|ECONN|ETIMEDOUT|network|server selection/i.test(message);

  return NextResponse.json(
    {
      success: false,
      error: isDatabaseError ? "Database temporarily unavailable" : fallback,
      code: isDatabaseError ? "DATABASE_UNAVAILABLE" : "REQUEST_FAILED",
    },
    { status: isDatabaseError ? 503 : status }
  );
}

export function jsonSuccess(data, init) {
  return NextResponse.json({ success: true, data }, init);
}
