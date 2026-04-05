import { z } from 'zod';

export const bookingCriteriaSchema = z.object({
  selectedDate: z.string().min(1, 'Booking date is required'),
  selectedPax: z.union([z.literal(1), z.literal(2)]),
  selectedDuration: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  selectedStartTime: z.string().min(1, 'Start time is required'),
});

export const customerDetailsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name is required')
    .max(100, 'Full name is too long')
    .refine((v) => !/^\d+$/.test(v), 'Enter a valid name'),
  mobileNumber: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 10, 'Enter a valid 10-digit mobile number'),
  alternateMobileNumber: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v.replace(/\D/g, '') : v))
    .refine((v) => !v || v.length === 10, 'Enter a valid alternate mobile number'),
  gender: z.union([z.literal('male'), z.literal('female'), z.literal('other')]),
  paxCount: z.union([z.literal(1), z.literal(2)]),
  aadhaarName: z.string().trim().min(2, 'Aadhaar name is required').max(100),
  aadhaarNumber: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 12, 'Aadhaar number must be 12 digits'),
  aadhaarDistrict: z
    .string()
    .trim()
    .min(1, 'Aadhaar district is required')
    .max(100)
    .refine((v) => v.toLowerCase() !== 'tirupati', 'Booking Restricted: Due to operational policy, local residents of Tirupati District are strictly prohibited from booking Fresh Up rooms.'),
  aadhaarState: z.string().trim().min(1, 'Aadhaar state is required').max(100),
  remarks: z.string().max(500).optional().or(z.literal('')),
  declarationOutsideTirupati: z.boolean().refine((val) => val === true, {
    message: 'Eligibility declaration is required',
  }),
  declarationAadhaarVerificationAccepted: z.boolean().refine((val) => val === true, {
    message: 'Verification acknowledgement is required',
  }),
  declarationPayAtHotelAccepted: z.boolean().refine((val) => val === true, {
    message: 'Pay at hotel acknowledgement is required',
  }),
});

export const bookingCreateSchema = z.object({
  roomNumber: z.string().min(1, 'Room is required'),
  bookingDate: z.string().min(1, 'Booking date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  durationHours: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  paxCount: z.union([z.literal(1), z.literal(2)]),
  amount: z.number().nonnegative(),
  customer: customerDetailsSchema,
});

export const aadhaarVerificationSchema = z.object({
  verificationResult: z.union([
    z.literal('verified'),
    z.literal('rejected'),
    z.literal('manual_review'),
  ]),
  districtValid: z.boolean(),
  managerRemarks: z.string().max(500).optional().or(z.literal('')),
  verifiedBy: z.string().trim().min(1, 'Verifier name is required'),
});

export const assignAlternateRoomSchema = z.object({
  bookingId: z.string().min(1),
  currentRoomNumber: z.string().min(1),
  alternateRoomNumber: z.string().min(1),
  reason: z.string().trim().min(1, 'Reason is required').max(200),
  remarks: z.string().max(500).optional().or(z.literal('')),
});
