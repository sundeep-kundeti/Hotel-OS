// ============================================================
// Travel Partner — TypeScript Types
// ============================================================

export type PartnerStatus =
  | 'Lead Only'
  | 'Not Contacted'
  | 'Contacted'
  | 'Interested'
  | 'Active Partner'
  | 'Not Interested'
  | 'Blocked';

export type LeadSource =
  | 'Vehicle Number Seen'
  | 'Walk-in Driver'
  | 'Travel Office'
  | 'Hotel Referral'
  | 'Existing Partner'
  | 'Manual Entry';

export type CommissionStatus = 'Pending' | 'Paid' | 'Cancelled' | 'Disputed';

export type PaymentMode = 'Pending' | 'Cash' | 'UPI' | 'Bank Transfer' | 'Adjusted';

export type ContactMethod = 'Call' | 'WhatsApp' | 'Direct Visit';

export type ResponseStatus =
  | 'Not Contacted'
  | 'Contacted'
  | 'Interested'
  | 'Active Partner'
  | 'Not Interested'
  | 'No Response'
  | 'Blocked';

// ============================================================
// Database row types (snake_case matches Supabase columns)
// ============================================================

export type TravelPartner = {
  id: string;
  created_at: string;
  updated_at: string;
  phone_number: string;
  vehicle_number: string;
  driver_name: string | null;
  vehicle_make: string | null;
  lead_source: LeadSource;
  partner_status: PartnerStatus;
  is_active: boolean;
  last_contacted_at: string | null;
  notes: string | null;
  created_by: string | null;
};

export type CommissionEntry = {
  id: string;
  created_at: string;
  partner_id: string;
  customer_name: string | null;
  room_number: string | null;
  booking_amount: number;
  commission_amount: number;
  commission_status: CommissionStatus;
  payment_mode: PaymentMode;
  paid_at: string | null;
  notes: string | null;
  entered_by: string | null;
};

export type FollowupLog = {
  id: string;
  created_at: string;
  partner_id: string;
  contact_method: ContactMethod | null;
  response_status: ResponseStatus | null;
  next_followup_at: string | null;
  notes: string | null;
  entered_by: string | null;
};

// ============================================================
// API response types
// ============================================================

export type PartnerSummary = {
  total_bookings: number;
  total_commission: number;
  total_paid: number;
  total_pending: number;
};

export type PartnerSearchResult = {
  found: boolean;
  results: TravelPartner[];
};

export type PartnerProfileResponse = {
  partner: TravelPartner;
  summary: PartnerSummary;
};

export type DashboardStats = {
  today_leads: number;
  today_commissions: number;
  pending_commission_amount: number;
  active_partners: number;
};

// ============================================================
// Form value types (camelCase for React forms)
// ============================================================

export type CreatePartnerFormValues = {
  phone_number: string;
  vehicle_number: string;
  driver_name: string;
  vehicle_make: string;
  lead_source: LeadSource | '';
  partner_status: PartnerStatus | '';
  notes: string;
};

export type CreateCommissionFormValues = {
  customer_name: string;
  room_number: string;
  booking_amount: string;
  commission_amount: string;
  commission_status: CommissionStatus;
  payment_mode: PaymentMode;
  notes: string;
};

export type CreateFollowupFormValues = {
  contact_method: ContactMethod | '';
  response_status: ResponseStatus | '';
  next_followup_at: string;
  notes: string;
};

// ============================================================
// Auth types
// ============================================================

export type TPSessionUser = {
  username: string;
  loginAt: string;
};

export type ReportType =
  | 'today_leads'
  | 'today_commissions'
  | 'pending_commissions'
  | 'paid_commissions'
  | 'active_partners'
  | 'lead_only';
