/**
 * Central helper for Hotel Management System (HMS) Supabase Edge Function calls.
 *
 * Auth strategy (two-header — same pattern as tpApi):
 *  - Authorization: Bearer <supabase_anon_key>  ← required by Supabase gateway
 *  - X-HMS-Session: <hms_session token>         ← our custom session, validated by edge fns
 */

/** Base URL for all hms-* Supabase Edge Functions */
export const HMS_FN_BASE =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '') + '/functions/v1';

/** Supabase anon key — satisfies the Supabase gateway JWT check */
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export type HMSRole = 'OWNER' | 'MANAGER' | 'HOUSEKEEPING';

export type HMSSession = {
  staffId: string;
  username: string;
  name: string;
  role: HMSRole;
  loginAt: string;
};

/**
 * Reads the hms_session token from localStorage (primary) or cookie (fallback).
 * localStorage is more reliable when the API is cross-origin (Supabase vs frontend domain).
 */
export function getHmsSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Primary: localStorage (works cross-origin)
  const ls = localStorage.getItem('hms_session');
  if (ls) return ls;
  // Fallback: cookie (same-origin only)
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/hms_session=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

/**
 * Saves the session token to localStorage so it survives cross-origin redirects.
 */
export function saveHmsSession(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hms_session', token);
  }
}

/**
 * Clears the HMS session from localStorage and cookie.
 */
export function clearHmsSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hms_session');
    document.cookie = 'hms_session=; Max-Age=0; Path=/';
  }
}

/**
 * Parses and returns the decoded HMS session, or null if not logged in / expired.
 */
export function getHmsSession(): HMSSession | null {
  const token = getHmsSessionToken();
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token)) as HMSSession;
    if (!decoded.username || !decoded.loginAt) return null;
    const loginTime = new Date(decoded.loginAt).getTime();
    if (Date.now() - loginTime > 12 * 60 * 60 * 1000) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Thin fetch wrapper that:
 *  1. Sends Authorization: Bearer <anon_key>  → passes Supabase gateway JWT check
 *  2. Sends X-HMS-Session: <token>            → our session, validated inside each fn
 */
export async function hmsFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getHmsSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['X-HMS-Session'] = token;
  }
  return fetch(`${HMS_FN_BASE}${path}`, { ...options, headers });
}

/**
 * Guest fetch — no session needed, just the anon key + token in query.
 * Used for public check-in / checkout pages.
 */
export async function hmsFetchPublic(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...(options.headers as Record<string, string> | undefined),
  };
  return fetch(`${HMS_FN_BASE}${path}`, { ...options, headers });
}
