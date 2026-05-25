/**
 * Central fetch helper for Fresh-Up + WhatsApp Supabase Edge Function calls.
 * Mirrors the pattern from tpApi.ts.
 */
export const FU_FN_BASE =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '') + '/functions/v1';

export async function fuFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${FU_FN_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    },
  });
}
