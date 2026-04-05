export const FRESH_UP_PRIMARY_ROOMS = [
  '501', '502', '503', '504', '505',
  '506', '507', '508', '509', '510',
  '601', '602', '603', '604', '605',
  '606', '607', '608', '609', '610',
] as const;

export const FRESH_UP_PAX_OPTIONS = [1, 2] as const;
export const FRESH_UP_DURATION_OPTIONS = [1, 2, 3] as const;
export const FRESH_UP_CLEANING_BUFFER_MINUTES = 15;

export const FRESH_UP_PUBLIC_BOOKING_STATUSES = [
  'pending_confirmation',
  'confirmed',
  'checked_in',
  'checked_out',
  'cleaning',
  'completed',
  'rejected',
  'cancelled',
  'no_show',
] as const;

export const FRESH_UP_ROOM_STATUSES = [
  'available',
  'booked',
  'occupied',
  'cleaning',
  'blocked',
] as const;

export const FRESH_UP_VERIFICATION_STATUSES = [
  'pending',
  'verified',
  'rejected',
  'manual_review',
] as const;
