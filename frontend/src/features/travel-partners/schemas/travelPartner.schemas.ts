// ============================================================
// Travel Partner — Zod Validation Schemas
// ============================================================
import { z } from 'zod';
import { normalizePhoneNumber, normalizeVehicleNumber, validateIndianVehicle } from '../utils/normalize';

// Indian state codes (as per spec)
const VALID_STATE_CODES = [
  'AP','TS','KA','TN','KL','MH','DL','UP','MP','RJ','GJ','HR','PB','CH','WB',
  'OD','CG','JH','BR','AS','AR','MN','ML','MZ','NL','SK','TR','GA','UK','HP',
  'JK','LA','PY','AN','DN','DD','LD','BH'
];

export const partnerStatusValues = [
  'Lead Only','Not Contacted','Contacted','Interested',
  'Active Partner','Not Interested','Blocked'
] as const;

export const leadSourceValues = [
  'Vehicle Number Seen','Walk-in Driver','Travel Office',
  'Hotel Referral','Existing Partner','Manual Entry'
] as const;

export const commissionStatusValues = ['Pending','Paid','Cancelled','Disputed'] as const;

export const paymentModeValues = ['Pending','Cash','UPI','Bank Transfer','Adjusted'] as const;

export const contactMethodValues = ['Call','WhatsApp','Direct Visit'] as const;

export const responseStatusValues = [
  'Not Contacted','Contacted','Interested','Active Partner',
  'Not Interested','No Response','Blocked'
] as const;

// ============================================================
// Phone validation
// ============================================================
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((val) => normalizePhoneNumber(val))
  .refine((val) => /^[6-9]\d{9}$/.test(val), {
    message: 'Enter a valid 10-digit Indian mobile number',
  });

// ============================================================
// Vehicle number validation
// ============================================================
export const vehicleSchema = z
  .string()
  .min(1, 'Vehicle number is required')
  .transform((val) => normalizeVehicleNumber(val))
  .refine((val) => validateIndianVehicle(val), {
    message: 'Enter a valid Indian vehicle number (e.g. KA03AB1234)',
  });

// ============================================================
// Create Partner schema
// ============================================================
export const createPartnerSchema = z.object({
  phone_number: phoneSchema,
  vehicle_number: vehicleSchema,
  driver_name: z.string().optional().default(''),
  vehicle_make: z.string().optional().default(''),
  lead_source: z.enum(leadSourceValues).default('Vehicle Number Seen'),
  partner_status: z.enum(partnerStatusValues).default('Lead Only'),
  notes: z.string().optional().default(''),
});

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;

// ============================================================
// Update Partner schema (all optional except phone+vehicle)
// ============================================================
export const updatePartnerSchema = z.object({
  driver_name: z.string().optional(),
  vehicle_make: z.string().optional(),
  lead_source: z.enum(leadSourceValues).optional(),
  partner_status: z.enum(partnerStatusValues).optional(),
  is_active: z.boolean().optional(),
  notes: z.string().optional(),
});

// ============================================================
// Create Commission schema
// ============================================================
export const createCommissionSchema = z.object({
  customer_name: z.string().optional().default(''),
  room_number: z.string().optional().default(''),
  booking_amount: z.coerce.number().min(0).default(0),
  commission_amount: z.coerce.number().min(1, 'Commission amount is required'),
  commission_status: z.enum(commissionStatusValues).default('Pending'),
  payment_mode: z.enum(paymentModeValues).default('Pending'),
  notes: z.string().optional().default(''),
});

export type CreateCommissionInput = z.infer<typeof createCommissionSchema>;

// ============================================================
// Create Follow-up schema
// ============================================================
export const createFollowupSchema = z.object({
  contact_method: z.enum(contactMethodValues).optional(),
  response_status: z.enum(responseStatusValues).optional(),
  next_followup_at: z.string().optional().nullable(),
  notes: z.string().optional().default(''),
});

export type CreateFollowupInput = z.infer<typeof createFollowupSchema>;

// ============================================================
// Auth schema
// ============================================================
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
