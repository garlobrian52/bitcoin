/**
 * Shared helpers for Connect API route handlers.
 */
import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

/** Narrow unknown thrown values to a string message for API responses. */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
