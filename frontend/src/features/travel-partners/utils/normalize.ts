// ============================================================
// Travel Partner — Phone & Vehicle Normalization Utilities
// ============================================================

// All valid Indian state/UT codes including BH series
const VALID_STATE_CODES = new Set([
  'AP','TS','KA','TN','KL','MH','DL','UP','MP','RJ','GJ','HR','PB','CH','WB',
  'OD','CG','JH','BR','AS','AR','MN','ML','MZ','NL','SK','TR','GA','UK','HP',
  'JK','LA','PY','AN','DN','DD','LD','BH'
]);

/**
 * Normalizes an Indian phone number to 10 digits.
 * Strips: spaces, hyphens, +91, 0 prefix
 * Example: "+91 98765 43210" → "9876543210"
 */
export function normalizePhoneNumber(input: string): string {
  let cleaned = input.replace(/[\s\-().]/g, ''); // remove spaces, hyphens, parens, dots
  // Remove country code prefixes
  if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.slice(1);
  return cleaned;
}

/**
 * Validates a normalized Indian phone number (10 digits, starts 6-9).
 */
export function validateIndianPhone(normalized: string): boolean {
  return /^[6-9]\d{9}$/.test(normalized);
}

/**
 * Normalizes an Indian vehicle number to uppercase with no spaces.
 * Examples:
 *   "KA 03 AB 1234" → "KA03AB1234"
 *   "ka03ab1234"    → "KA03AB1234"
 */
export function normalizeVehicleNumber(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase();
}

/**
 * Formats a normalized vehicle number for display.
 * Examples:
 *   "KA03AB1234" → "KA 03 AB 1234"
 *   "BH12AB1234" → "BH 12 AB 1234"
 *   "DL1CAB1234" → "DL 1C AB 1234"  (old 4-digit, best-effort)
 */
export function formatVehicleNumber(normalized: string): string {
  if (!normalized) return '';
  // Standard format: 2-letter state, 2-digit district, 2-letter series, 4-digit number
  const match = normalized.match(/^([A-Z]{2})(\d{2})([A-Z]{1,3})(\d{1,4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  // Best-effort: just return as-is with no formatting
  return normalized;
}

/**
 * Validates a normalized Indian vehicle number.
 * Checks state code prefix and basic pattern.
 * Accepts: KA03AB1234, BH12AB1234, etc.
 */
export function validateIndianVehicle(normalized: string): boolean {
  if (!normalized || normalized.length < 6 || normalized.length > 13) return false;

  // Must start with a valid 2-letter state code
  const stateCode = normalized.slice(0, 2);
  if (!VALID_STATE_CODES.has(stateCode)) return false;

  // BH series: BH + 2 digits + 2 letters + 4 digits
  if (stateCode === 'BH') {
    return /^BH\d{2}[A-Z]{2}\d{4}$/.test(normalized);
  }

  // Standard series: state(2) + district(2 digits) + series(1-3 alpha) + number(1-4 digits)
  return /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/.test(normalized);
}

/**
 * Formats an amount in Indian currency (₹).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a datetime string to a human-readable local IST format.
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(isoString));
}

/**
 * Formats a date string to short date (no time).
 */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(isoString));
}

/**
 * Returns today's date as YYYY-MM-DD in IST.
 */
export function getTodayIST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}
