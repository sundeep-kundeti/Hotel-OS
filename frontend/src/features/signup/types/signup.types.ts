export type SignupStep = 'mobile' | 'otp' | 'profile' | 'success';

export type SignupProfileFormValues = {
  fullName: string;
  email: string;
  dateOfBirth: string;
  anniversaryDate: string;
  city: string;
  referralCode: string;
  consents: {
    terms: boolean;
    privacy: boolean;
    promoWhatsapp: boolean;
    promoSms: boolean;
    promoEmail: boolean;
    transactionalWhatsapp: boolean;
    transactionalSms: boolean;
  };
};

export type SignupFlowState = {
  step: SignupStep;
  mobile: string;
  maskedMobile: string;
  countryCode: string;
  signupToken?: string;
  accessToken?: string;
  refreshToken?: string;
  profileCompleted: boolean;
  isLoading: boolean;
  error?: string;
  otpExpiresIn?: number;
  resendAfter?: number;
  guest?: {
    guestId: string;
    guestCode: string;
    fullName: string;
  };
  wallet?: {
    availablePoints: number;
    tierCode: string;
  };
  offers?: Array<{
    offerCode: string;
    offerType: string;
    validUntil: string;
  }>;
};

export type SignupFlowContainerProps = {
  initialSource?: {
    source?: string;
    medium?: string;
    campaign?: string;
    landingPage?: string;
    referralCode?: string;
  };
};
