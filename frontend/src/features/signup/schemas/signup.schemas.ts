import { z } from 'zod';

export const mobileSchema = z.object({
  countryCode: z.string().min(2),
  mobile: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 10, 'Please enter a valid 10-digit mobile number'),
});

export const otpSchema = z.object({
  otpCode: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 6, 'Please enter a valid 6-digit OTP'),
});

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name is required')
    .max(100, 'Full name is too long')
    .refine((v) => !/^\d+$/.test(v), 'Enter a valid name'),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email'),
  dateOfBirth: z.string().optional(),
  anniversaryDate: z.string().optional(),
  city: z.string().trim().max(100, 'City is too long').optional().or(z.literal('')),
  referralCode: z.string().trim().max(50).optional().or(z.literal('')),
  consents: z.object({
    terms: z.boolean().refine((val) => val === true, { message: 'Terms acceptance is required' }),
    privacy: z.boolean().refine((val) => val === true, { message: 'Privacy acceptance is required' }),
    promoWhatsapp: z.boolean(),
    promoSms: z.boolean(),
    promoEmail: z.boolean(),
    transactionalWhatsapp: z.boolean(),
    transactionalSms: z.boolean(),
  }),
});
