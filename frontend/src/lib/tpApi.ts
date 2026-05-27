/**
 * Central helper for Travel-Partners Supabase Edge Function calls.
 *
 * All travel-partners data routes have been migrated OUT of the Next.js
 * CF Worker bundle and into Supabase Edge Functions to stay under the
 * Cloudflare free-tier 3 MiB Worker size limit.
 *
 * Auth strategy (two-header):
 *  - Authorization: Bearer <supabase_anon_key>  ← required by Supabase gateway
 *  - X-TP-Session: <tp_session token>           ← our custom session, read by edge fns
 *
 * Supabase's gateway validates the Authorization header as a Supabase JWT.
 * Our custom base64 token is NOT a JWT, so it must travel in X-TP-Session instead.
 * The anon key satisfies the gateway; edge functions do their own auth via X-TP-Session.
 */

/** Base URL for all tp-* Supabase Edge Functions */
export const TP_FN_BASE =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '') + '/functions/v1';

/** Supabase anon key — satisfies the Supabase gateway JWT check */
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Reads the `tp_session` cookie value (URL-decoded to fix base64 padding).
 * Must only be called in a browser context (client components).
 */
export function getTpSessionToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/tp_session=([^;]+)/);
  if (!match) return null;
  // decodeURIComponent fixes %3D → = (URL-encoded base64 padding in cookies)
  return decodeURIComponent(match[1]);
}

/**
 * Thin wrapper around fetch that:
 *  1. Sends Authorization: Bearer <anon_key>  → passes Supabase gateway JWT check
 *  2. Sends X-TP-Session: <token>             → our session, validated inside each fn
 */
export async function tpFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getTpSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Anon key satisfies Supabase gateway (it expects a valid Supabase JWT here)
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['X-TP-Session'] = token;
  }
  return fetch(`${TP_FN_BASE}${path}`, { ...options, headers });
}
