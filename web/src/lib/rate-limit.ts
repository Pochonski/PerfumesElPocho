import type { NextRequest } from "next/server";

const MAX_ENTRIES = 10_000;
const store = new Map<string, { count: number; resetAt: number }>();

export function getClientIP(request: NextRequest): string {
  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) {
    const first = vercel.split(",")[0]?.trim();
    if (first) return first;
  }
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  ip: string,
  opts: { windowMs: number; max: number }
): { allowed: boolean; remaining: number; resetIn?: number } {
  const { windowMs, max } = opts;
  const now = Date.now();

  if (store.size > MAX_ENTRIES) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
    if (store.size > MAX_ENTRIES) {
      const overflow = store.size - MAX_ENTRIES;
      let i = 0;
      for (const key of store.keys()) {
        if (i++ >= overflow) break;
        store.delete(key);
      }
    }
  }

  const entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  entry.count++;
  return { allowed: true, remaining: max - entry.count };
}