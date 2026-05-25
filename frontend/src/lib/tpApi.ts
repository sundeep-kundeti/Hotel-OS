/**
 * Central helper for Travel-Partners Supabase Edge Function calls.
 *
 * All travel-partners data routes have been migrated OUT of the Next.js
 * CF Worker bundle and into Supabase Edge Functions to stay under the
 * Cloudflare free-tier 3 MiB Worker size limit.
 *
 * Auth: The `tp_session` cookie token is passed as `Authorization: Bearer <token>`
 * on every request so the Edge Functions can validate it server-side.
 */

/** Base URL for all tp-* Supabase Edge Functions */
export const TP_FN_BASE =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '') + '/functions/v1';

/**
 * Reads the `tp_session` cookie and returns it as a Bearer token header.
 * Must only be called in a browser context (client components).
 */
export function getTpAuthHeader(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  const match = document.cookie.match(/tp_session=([^;]+)/);
  if (!match) return {};
  return { Authorization: `Bearer ${match[1]}` };
}

/**
 * Thin wrapper around fetch that automatically injects the tp_session
 * Bearer token and the Content-Type header for JSON bodies.
 */
export async function tpFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const authHeader = getTpAuthHeader();
  return fetch(`${TP_FN_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options.headers as Record<string, string> | undefined),
    },
  });
}
