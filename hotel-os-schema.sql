-- ============================================================
-- Srimuni Hotels — Hotel Management System (HMS) Schema
-- Run this ONCE in Supabase SQL Editor
-- Project: wurhdqlnnjcehpppkddv
-- ============================================================

-- ============================================================
-- 1. STAFF USERS (OWNER / MANAGER / HOUSEKEEPING)
-- ============================================================
create table if not exists hms_staff (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,      -- stored as plain for MVP (same pattern as TP)
  name text not null,
  role text not null,               -- OWNER | MANAGER | HOUSEKEEPING
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Allowed roles: OWNER, MANAGER, HOUSEKEEPING

-- ============================================================
-- 2. ROOMS
-- ============================================================
create table if not exists hms_rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text unique not null,
  room_type text not null,          -- Non-AC | AC | Deluxe AC
  floor integer not null,
  base_rate numeric not null default 0,
  status text not null default 'Vacant Clean',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Status values: Vacant Clean | Reserved | Pending Check-In | Occupied | Checkout Pending | Cleaning | Vacant Dirty | Blocked

-- Auto-update updated_at
create or replace function hms_update_room_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_hms_rooms_updated_at on hms_rooms;
create trigger trg_hms_rooms_updated_at
  before update on hms_rooms
  for each row execute procedure hms_update_room_updated_at();

-- ============================================================
-- 3. BOOKINGS
-- ============================================================
create table if not exists hms_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique not null,  -- HSS-2026-000001
  guest_name text not null,
  guest_phone text not null,
  room_id uuid references hms_rooms(id),
  room_number text not null,
  room_type text not null,
  source text not null,               -- Walk-in | Phone | WhatsApp | Website | OTA | Broker | Repeat Guest
  checkin_expected timestamptz not null,
  checkout_expected timestamptz not null,
  checkin_actual timestamptz,
  guest_checkout_time timestamptz,
  manager_checkout_time timestamptz,
  amount numeric not null,
  amount_collected numeric not null default 0,
  payment_mode text not null,         -- Cash | UPI | Card | Online | OTA | Credit
  payment_status text not null default 'Pending',  -- Pending | Paid | Partial | Refunded
  booking_status text not null default 'Created',
  -- Status values: Created | Pending Check-In | Checked In | Guest Checked Out | Manager Checked Out | Cleaning Pending | Closed | Cancelled | Exception
  checkin_token text unique,
  checkout_token text unique,
  created_by uuid references hms_staff(id),
  manual_checkout_reason text,
  remarks text,
  id_type text,
  id_last4 text,
  rating integer,                     -- 1-5 guest rating on checkout
  feedback text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function hms_update_booking_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_hms_bookings_updated_at on hms_bookings;
create trigger trg_hms_bookings_updated_at
  before update on hms_bookings
  for each row execute procedure hms_update_booking_updated_at();

create index if not exists idx_hms_bookings_room_id on hms_bookings(room_id);
create index if not exists idx_hms_bookings_status on hms_bookings(booking_status);
create index if not exists idx_hms_bookings_guest_phone on hms_bookings(guest_phone);
create index if not exists idx_hms_bookings_created_at on hms_bookings(created_at);
create index if not exists idx_hms_bookings_checkin_token on hms_bookings(checkin_token);
create index if not exists idx_hms_bookings_checkout_token on hms_bookings(checkout_token);

-- ============================================================
-- 4. ROOM STATUS LOGS (immutable audit trail)
-- ============================================================
create table if not exists hms_room_status_logs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references hms_rooms(id),
  room_number text not null,
  booking_id uuid references hms_bookings(id),
  old_status text,
  new_status text not null,
  changed_by_role text not null,   -- OWNER | MANAGER | HOUSEKEEPING | GUEST | SYSTEM
  changed_by_staff_id uuid references hms_staff(id),
  changed_by_guest_phone text,
  reason text,
  remarks text,
  created_at timestamptz default now()
);

create index if not exists idx_hms_room_logs_room_id on hms_room_status_logs(room_id);
create index if not exists idx_hms_room_logs_booking_id on hms_room_status_logs(booking_id);
create index if not exists idx_hms_room_logs_created_at on hms_room_status_logs(created_at);

-- ============================================================
-- 5. REWARDS
-- ============================================================
create table if not exists hms_rewards (
  id uuid primary key default gen_random_uuid(),
  reward_code text unique not null,    -- RWD-2026-000001
  booking_id uuid references hms_bookings(id),
  guest_phone text not null,
  coupon_code text unique not null,    -- HSS100-AB12
  coupon_value numeric not null default 100,
  status text not null default 'Inactive',
  -- Status: Inactive | Pending Activation | Active | Used | Expired | Blocked | Not Activated
  created_at timestamptz default now(),
  activated_at timestamptz,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_booking_id uuid references hms_bookings(id),
  blocked_by uuid references hms_staff(id),
  blocked_reason text
);

create index if not exists idx_hms_rewards_guest_phone on hms_rewards(guest_phone);
create index if not exists idx_hms_rewards_booking_id on hms_rewards(booking_id);
create index if not exists idx_hms_rewards_coupon_code on hms_rewards(coupon_code);

-- ============================================================
-- 6. HOUSEKEEPING LOGS
-- ============================================================
create table if not exists hms_housekeeping_logs (
  id uuid primary key default gen_random_uuid(),
  cleaning_code text unique not null,
  room_id uuid references hms_rooms(id),
  room_number text not null,
  booking_id uuid references hms_bookings(id),
  cleaning_start timestamptz,
  cleaning_end timestamptz,
  cleaned_by uuid references hms_staff(id),
  photo_url text,
  damage_found boolean default false,
  lost_item_found boolean default false,
  remarks text,
  created_at timestamptz default now()
);

create index if not exists idx_hms_hk_room_id on hms_housekeeping_logs(room_id);
create index if not exists idx_hms_hk_booking_id on hms_housekeeping_logs(booking_id);
create index if not exists idx_hms_hk_created_at on hms_housekeeping_logs(created_at);

-- ============================================================
-- 7. AUDIT LOGS
-- ============================================================
create table if not exists hms_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity text not null,
  entity_id uuid,
  old_value text,
  new_value text,
  changed_by_staff_id uuid references hms_staff(id),
  changed_by_role text,
  reason text,
  risk_level text default 'LOW',   -- LOW | MEDIUM | HIGH | CRITICAL
  created_at timestamptz default now()
);

create index if not exists idx_hms_audit_entity on hms_audit_logs(entity, entity_id);
create index if not exists idx_hms_audit_risk on hms_audit_logs(risk_level);
create index if not exists idx_hms_audit_created_at on hms_audit_logs(created_at);

-- ============================================================
-- 8. EXCEPTIONS
-- ============================================================
create table if not exists hms_exceptions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references hms_bookings(id),
  room_id uuid references hms_rooms(id),
  room_number text,
  exception_type text not null,
  -- Types: MANAGER_CHECKOUT_WITHOUT_GUEST | ROOM_OCCUPIED_WITHOUT_CHECKIN | ROOM_ASSIGNED_BEFORE_CLEANING
  --        CASH_WITHOUT_PAYMENT_CONFIRMATION | BOOKING_EDITED_AFTER_CHECKIN | CHECKOUT_OVERDUE
  --        GUEST_CHECKOUT_MISSING | ROOM_STATUS_MANUAL_CHANGE | SAME_ROOM_SHORT_GAP_RESALE
  description text not null,
  risk_level text not null,        -- MEDIUM | HIGH | CRITICAL
  status text default 'Open',     -- Open | Resolved | Dismissed
  created_by_staff_id uuid references hms_staff(id),
  resolved_by uuid references hms_staff(id),
  resolution_note text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create index if not exists idx_hms_exceptions_booking_id on hms_exceptions(booking_id);
create index if not exists idx_hms_exceptions_status on hms_exceptions(status);
create index if not exists idx_hms_exceptions_risk on hms_exceptions(risk_level);
create index if not exists idx_hms_exceptions_type_booking on hms_exceptions(exception_type, booking_id);

-- ============================================================
-- 10. SEQUENCES (for human-readable codes)
-- ============================================================
create sequence if not exists hms_booking_seq start 1;
create sequence if not exists hms_reward_seq start 1;
create sequence if not exists hms_cleaning_seq start 1;

-- ============================================================
-- 11. ROW LEVEL SECURITY — all access via service role only
-- ============================================================
alter table hms_staff             enable row level security;
alter table hms_rooms             enable row level security;
alter table hms_bookings          enable row level security;
alter table hms_room_status_logs  enable row level security;
alter table hms_rewards           enable row level security;
alter table hms_housekeeping_logs enable row level security;
alter table hms_audit_logs        enable row level security;
alter table hms_exceptions        enable row level security;

-- No policies = deny all anon/authenticated REST API access
-- Service role (edge functions) bypasses RLS

-- ============================================================
-- 12. PRICING COLUMNS — add to hms_rooms (safe to re-run)
-- ============================================================
alter table hms_rooms
  add column if not exists max_rate                    numeric not null default 1600,
  add column if not exists is_ac                       boolean default false,
  add column if not exists is_deluxe                   boolean default false,
  add column if not exists luxury_addon_available      boolean default true,
  add column if not exists extra_amenities_available   boolean default true;

-- ============================================================
-- 13. SEED DATA — Default Staff Accounts
-- Passwords stored as plain text for MVP. Change after first login.
-- ============================================================
insert into hms_staff (username, password_hash, name, role) values
  ('owner',      'Owner@Srimuni2026',   'Hotel Owner',        'OWNER'),
  ('manager',    'Manager@Srimuni2026', 'Front Desk Manager', 'MANAGER'),
  ('housekeep1', 'House@Srimuni2026',   'Housekeeping Staff', 'HOUSEKEEPING')
on conflict (username) do nothing;


-- ============================================================
-- SEED DATA — 61 Rooms (Srimuni Hotels — Final Layout)
--
-- Room classification:
--   AC (₹1200–₹2200)   : 201–210, 608
--   Deluxe AC (₹2500)  : 211, 311, 411, 511
--   Non-AC (₹900–₹1600): 101–107, 301–310, 401–410, 501–510, 601–610 (excl 608)
--
-- Floor 1 : 101–107  (7 rooms)  Non-AC
-- Floor 2 : 201–210  (10 rooms) AC  +  211 (1 room) Deluxe AC
-- Floor 3 : 301–310  (10 rooms) Non-AC  +  311 (1 room) Deluxe AC
-- Floor 4 : 401–410  (10 rooms) Non-AC  +  411 (1 room) Deluxe AC
-- Floor 5 : 501–510  (10 rooms) Non-AC  +  511 (1 room) Deluxe AC
-- Floor 6 : 601–607, 609–610 (9 rooms) Non-AC  +  608 (1 room) AC
-- Total   : 7 + 11 + 11 + 11 + 11 + 10 = 61 rooms
-- ============================================================
insert into hms_rooms (room_number, room_type, floor, base_rate, max_rate, is_ac, is_deluxe, status) values
  -- ── Floor 1 Non-AC (101–107) ────────────────────────────────
  ('101', 'Non-AC', 1,  900, 1600, false, false, 'Vacant Clean'),
  ('102', 'Non-AC', 1,  900, 1600, false, false, 'Vacant Clean'),
  ('103', 'Non-AC', 1,  900, 1600, false, false, 'Vacant Clean'),
  ('104', 'Non-AC', 1,  900, 1600, false, false, 'Vacant Clean'),
  ('105', 'Non-AC', 1,  900, 1600, false, false, 'Vacant Clean'),
  ('106', 'Non-AC', 1,  900, 1600, false, false, 'Vacant Clean'),
  ('107', 'Non-AC', 1,  900, 1600, false, false, 'Vacant Clean'),
  -- ── Floor 2 AC (201–210) + Deluxe (211) ────────────────────
  ('201', 'AC',        2, 1200, 2200, true,  false, 'Vacant Clean'),
  ('202', 'AC',        2, 1200, 2200, true,  false, 'Vacant Clean'),
  ('203', 'AC',        2, 1200, 2200, true,  false, 'Vacant Clean'),
  ('204', 'AC',        2, 1200, 2200, true,  false, 'Vacant Clean'),
  ('205', 'AC',        2, 1200, 2200, true,  false, 'Vacant Clean'),
  ('206', 'AC',        2, 1200, 2200, true,  false, 'Vacant Clean'),
  ('207', 'AC',        2, 1200, 2200, true,  false, 'Vacant Clean'),
  ('208', 'AC',        2, 1200, 2200, true,  false, 'Vacant Clean'),
  ('209', 'AC',        2, 1200, 2200, true,  false, 'Vacant Clean'),
  ('210', 'AC',        2, 1200, 2200, true,  false, 'Vacant Clean'),
  ('211', 'Deluxe AC', 2, 2500, 2500, true,  true,  'Vacant Clean'),
  -- ── Floor 3 Non-AC (301–310) + Deluxe (311) ────────────────
  ('301', 'Non-AC',    3,  900, 1600, false, false, 'Vacant Clean'),
  ('302', 'Non-AC',    3,  900, 1600, false, false, 'Vacant Clean'),
  ('303', 'Non-AC',    3,  900, 1600, false, false, 'Vacant Clean'),
  ('304', 'Non-AC',    3,  900, 1600, false, false, 'Vacant Clean'),
  ('305', 'Non-AC',    3,  900, 1600, false, false, 'Vacant Clean'),
  ('306', 'Non-AC',    3,  900, 1600, false, false, 'Vacant Clean'),
  ('307', 'Non-AC',    3,  900, 1600, false, false, 'Vacant Clean'),
  ('308', 'Non-AC',    3,  900, 1600, false, false, 'Vacant Clean'),
  ('309', 'Non-AC',    3,  900, 1600, false, false, 'Vacant Clean'),
  ('310', 'Non-AC',    3,  900, 1600, false, false, 'Vacant Clean'),
  ('311', 'Deluxe AC', 3, 2500, 2500, true,  true,  'Vacant Clean'),
  -- ── Floor 4 Non-AC (401–410) + Deluxe (411) ────────────────
  ('401', 'Non-AC',    4,  900, 1600, false, false, 'Vacant Clean'),
  ('402', 'Non-AC',    4,  900, 1600, false, false, 'Vacant Clean'),
  ('403', 'Non-AC',    4,  900, 1600, false, false, 'Vacant Clean'),
  ('404', 'Non-AC',    4,  900, 1600, false, false, 'Vacant Clean'),
  ('405', 'Non-AC',    4,  900, 1600, false, false, 'Vacant Clean'),
  ('406', 'Non-AC',    4,  900, 1600, false, false, 'Vacant Clean'),
  ('407', 'Non-AC',    4,  900, 1600, false, false, 'Vacant Clean'),
  ('408', 'Non-AC',    4,  900, 1600, false, false, 'Vacant Clean'),
  ('409', 'Non-AC',    4,  900, 1600, false, false, 'Vacant Clean'),
  ('410', 'Non-AC',    4,  900, 1600, false, false, 'Vacant Clean'),
  ('411', 'Deluxe AC', 4, 2500, 2500, true,  true,  'Vacant Clean'),
  -- ── Floor 5 Non-AC (501–510) + Deluxe (511) ────────────────
  ('501', 'Non-AC',    5,  900, 1600, false, false, 'Vacant Clean'),
  ('502', 'Non-AC',    5,  900, 1600, false, false, 'Vacant Clean'),
  ('503', 'Non-AC',    5,  900, 1600, false, false, 'Vacant Clean'),
  ('504', 'Non-AC',    5,  900, 1600, false, false, 'Vacant Clean'),
  ('505', 'Non-AC',    5,  900, 1600, false, false, 'Vacant Clean'),
  ('506', 'Non-AC',    5,  900, 1600, false, false, 'Vacant Clean'),
  ('507', 'Non-AC',    5,  900, 1600, false, false, 'Vacant Clean'),
  ('508', 'Non-AC',    5,  900, 1600, false, false, 'Vacant Clean'),
  ('509', 'Non-AC',    5,  900, 1600, false, false, 'Vacant Clean'),
  ('510', 'Non-AC',    5,  900, 1600, false, false, 'Vacant Clean'),
  ('511', 'Deluxe AC', 5, 2500, 2500, true,  true,  'Vacant Clean'),
  -- ── Floor 6 Non-AC (601–607, 609–610) + AC (608) ────────────
  ('601', 'Non-AC',    6,  900, 1600, false, false, 'Vacant Clean'),
  ('602', 'Non-AC',    6,  900, 1600, false, false, 'Vacant Clean'),
  ('603', 'Non-AC',    6,  900, 1600, false, false, 'Vacant Clean'),
  ('604', 'Non-AC',    6,  900, 1600, false, false, 'Vacant Clean'),
  ('605', 'Non-AC',    6,  900, 1600, false, false, 'Vacant Clean'),
  ('606', 'Non-AC',    6,  900, 1600, false, false, 'Vacant Clean'),
  ('607', 'Non-AC',    6,  900, 1600, false, false, 'Vacant Clean'),
  ('608', 'AC',        6, 1200, 2200, true,  false, 'Vacant Clean'),
  ('609', 'Non-AC',    6,  900, 1600, false, false, 'Vacant Clean'),
  ('610', 'Non-AC',    6,  900, 1600, false, false, 'Vacant Clean')
on conflict (room_number) do nothing;

-- ============================================================
-- MIGRATION — Correct existing rooms if already seeded
-- Run this if hms_rooms already exists in the DB.
-- Does NOT change room status.
-- ============================================================

-- Step 1: Reset all rooms to Non-AC base
update hms_rooms set
  room_type = 'Non-AC', base_rate = 900, max_rate = 1600,
  is_ac = false, is_deluxe = false,
  luxury_addon_available = true, extra_amenities_available = true;

-- Step 2: Set AC rooms — 201–210 and 608
update hms_rooms set
  room_type = 'AC', base_rate = 1200, max_rate = 2200, is_ac = true, is_deluxe = false
where room_number in ('201','202','203','204','205','206','207','208','209','210','608');

-- Step 3: Set Deluxe AC rooms — 211, 311, 411, 511
update hms_rooms set
  room_type = 'Deluxe AC', base_rate = 2500, max_rate = 2500, is_ac = true, is_deluxe = true
where room_number in ('211','311','411','511');


-- ============================================================
-- ADD-ON TABLES
-- ============================================================

-- Room-level add-on catalogue
create table if not exists hms_room_addons (
  id           uuid primary key default gen_random_uuid(),
  addon_name   text not null,
  addon_type   text not null,   -- AMENITY | LUXURY | COMFORT
  price        numeric not null,
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- Per-booking add-on line items
create table if not exists hms_booking_addons (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid references hms_bookings(id) on delete cascade,
  addon_id     uuid references hms_room_addons(id),
  addon_name   text not null,
  addon_price  numeric not null,
  quantity     integer default 1,
  total_price  numeric generated always as (addon_price * quantity) stored,
  created_at   timestamptz default now()
);

create index if not exists idx_hms_booking_addons_booking_id on hms_booking_addons(booking_id);

alter table hms_room_addons    enable row level security;
alter table hms_booking_addons enable row level security;

-- ============================================================
-- SEED DATA — Add-on Catalogue
-- ============================================================
insert into hms_room_addons (addon_name, addon_type, price) values
  ('Extra Pillow',       'COMFORT',  50),
  ('Extra Bedsheet',     'COMFORT', 100),
  ('Extra Mattress',     'COMFORT', 200),
  ('Tea / Coffee Kit',   'AMENITY', 100),
  ('Premium Towel Set',  'LUXURY',  150),
  ('Luxury Toiletry Kit','LUXURY',  200),
  ('Early Check-In',     'AMENITY', 300),
  ('Late Checkout',      'AMENITY', 300)
on conflict do nothing;

-- ============================================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================================
-- 1. Count by type:
-- select room_type, base_rate, max_rate, is_ac, is_deluxe, count(*)
-- from hms_rooms
-- group by room_type, base_rate, max_rate, is_ac, is_deluxe
-- order by room_type;
--
-- Expected:
--   AC         | 1200 | 2200 | true  | false | 11
--   Deluxe AC  | 2500 | 2500 | true  | true  |  5
--   Non-AC     |  900 | 1600 | false | false | 46 (or remaining)
--
-- 2. Spot-check specific rooms:
-- select room_number, room_type, base_rate, max_rate, is_ac, is_deluxe
-- from hms_rooms
-- where room_number in ('201','211','311','411','511','611','608','101','301','401','501','601')
-- order by room_number;
-- ============================================================


