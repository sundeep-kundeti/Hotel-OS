export type FreshUpPaxCount = 1 | 2;
export type FreshUpDurationHours = 1 | 2 | 3;

export type FreshUpRoomStatus =
  | 'available'
  | 'booked'
  | 'occupied'
  | 'cleaning'
  | 'blocked';

export type FreshUpBookingStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cleaning'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'no_show';

export type FreshUpVerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'manual_review';

export type FreshUpPaymentMode = 'pay_at_hotel';
export type FreshUpPaymentStatus = 'pending' | 'paid';

export type FreshUpBookingCriteria = {
  selectedDate: string;
  selectedPax: FreshUpPaxCount;
  selectedDuration: FreshUpDurationHours;
  selectedStartTime: string;
};

export type FreshUpRoomAvailability = {
  roomNumber: string;
  floor: number;
  isPrimary: boolean;
  status: FreshUpRoomStatus;
  matchedSlotAvailable: boolean;
  matchedSlotReason?: string;
  nextAvailableTime?: string;
};

export type BookingSummary = {
  roomNumber?: string;
  bookingDate: string;
  startTime: string;
  endTime?: string;
  cleaningEndTime?: string;
  paxCount: FreshUpPaxCount;
  durationHours: FreshUpDurationHours;
  amount: number;
  paymentMode: FreshUpPaymentMode;
};

export type CustomerDetailsFormValues = {
  fullName: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  gender: 'male' | 'female' | 'other' | '';
  paxCount: FreshUpPaxCount;
  aadhaarName: string;
  aadhaarNumber: string;
  aadhaarDistrict: string;
  aadhaarState: string;
  remarks: string;
  declarationOutsideTirupati: boolean;
  declarationAadhaarVerificationAccepted: boolean;
  declarationPayAtHotelAccepted: boolean;
};

export type FreshUpBookingCreateRequest = {
  roomNumber: string;
  bookingDate: string;
  startTime: string;
  durationHours: FreshUpDurationHours;
  paxCount: FreshUpPaxCount;
  amount: number;
  customer: CustomerDetailsFormValues;
};

export type FreshUpBookingCreateResponse = {
  bookingId: string;
  bookingCode: string;
  status: FreshUpBookingStatus;
  roomNumber: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  cleaningEndTime: string;
  amount: number;
  paymentMode: FreshUpPaymentMode;
};

export type FreshUpBookingPageState = {
  selectedDate: string;
  selectedPax: FreshUpPaxCount;
  selectedDuration: FreshUpDurationHours;
  selectedStartTime: string;
  selectedRoomNumber?: string;
  calculatedAmount: number;
  availabilityLoading: boolean;
  bookingSubmitting: boolean;
  availabilityError?: string;
  bookingError?: string;
  bookingSuccess?: {
    bookingId: string;
    bookingCode: string;
  };
};

export type FreshUpDashboardSummary = {
  totalBookingsToday: number;
  activeOccupiedRooms: number;
  cleaningRooms: number;
  availablePrimaryRooms: number;
  pendingVerification: number;
  expectedCollectionToday: number;
};

export type ManagerRoomScheduleCardData = {
  roomNumber: string;
  floor: number;
  currentStatus: FreshUpRoomStatus | 'reserved';
  currentGuestName?: string;
  bookingId?: string;
  currentBookingStart?: string;
  currentBookingEnd?: string;
  cleaningEnd?: string;
  nextAvailableTime?: string;
  nextBookingStart?: string;
  nextBookingGuestName?: string;
};

export type ManagerBookingTableRow = {
  bookingId: string;
  bookingCode: string;
  roomNumber: string;
  guestName: string;
  mobileNumber: string;
  paxCount: FreshUpPaxCount;
  bookingDate: string;
  startTime: string;
  endTime: string;
  cleaningEndTime: string;
  amount: number;
  paymentStatus: FreshUpPaymentStatus;
  verificationStatus: FreshUpVerificationStatus;
  status: FreshUpBookingStatus;
  remarks?: string;
};

export type AadhaarVerificationFormValues = {
  verificationResult: FreshUpVerificationStatus;
  districtValid: boolean;
  managerRemarks: string;
  verifiedBy: string;
};

export type AssignAlternateRoomFormValues = {
  bookingId: string;
  currentRoomNumber: string;
  alternateRoomNumber: string;
  reason: string;
  remarks: string;
};
