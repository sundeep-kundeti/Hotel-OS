-- Hotel OS MVP Database Schema

-- Enums
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'FRONT_DESK', 'GUEST');
CREATE TYPE reward_tier AS ENUM ('SILVER', 'GOLD', 'PLATINUM');
CREATE TYPE auth_provider AS ENUM ('LOCAL', 'GOOGLE', 'FACEBOOK');

-- 1. User & Auth Data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role user_role DEFAULT 'GUEST',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider auth_provider NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

CREATE TABLE otp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Guest Domain
CREATE TABLE guest_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    dob DATE,
    anniversary DATE,
    city VARCHAR(100),
    acquisition_source VARCHAR(100),
    referral_code_used VARCHAR(50),
    marketing_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rewards Domain
CREATE TABLE reward_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES guest_profiles(id) ON DELETE CASCADE UNIQUE,
    available_points INTEGER DEFAULT 0,
    locked_points INTEGER DEFAULT 0,
    redeemed_points INTEGER DEFAULT 0,
    tier_level reward_tier DEFAULT 'SILVER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES reward_wallets(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'EARN', 'BURN', 'EXPIRE'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Simple Offer Assignment (MVP)
CREATE TABLE user_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES guest_profiles(id) ON DELETE CASCADE,
    coupon_code VARCHAR(50) NOT NULL,
    discount_percentage DECIMAL(5, 2),
    max_discount_amount DECIMAL(10, 2),
    is_redeemed BOOLEAN DEFAULT FALSE,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
