export interface RegisterRequest {
  name: string;
  mobile: string;
  email?: string;
  dob?: string;
  anniversary?: string;
  source?: string;
  referralCode?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  guestId?: string;
}

export interface SendOtpRequest {
  mobile: string;
}

export interface VerifyOtpRequest {
  mobile: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  token?: string; // JWT
  isNewUser: boolean;
}
