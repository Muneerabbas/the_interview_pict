import { NextResponse } from "next/server";

export function ok(data, init = {}) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created(data, init = {}) {
  return NextResponse.json(data, { status: 201, ...init });
}

export function badRequest(message, details) {
  return NextResponse.json(
    { message, ...(details ? { details } : {}) },
    { status: 400 }
  );
}

export function notFound(message) {
  return NextResponse.json({ message }, { status: 404 });
}

export function serverError(error, fallbackMessage = "Internal server error") {
  const message = error instanceof Error ? error.message : fallbackMessage;
  console.error(error);
  return NextResponse.json({ message }, { status: 500 });
}
