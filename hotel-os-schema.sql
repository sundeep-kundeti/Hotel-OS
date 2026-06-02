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
  room_type text not null,          -- Standard | Deluxe | AC | Non-AC
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
-- 9. SEQUENCES (for human-readable codes)
-- ============================================================
create sequence if not exists hms_booking_seq start 1;
create sequence if not exists hms_reward_seq start 1;
create sequence if not exists hms_cleaning_seq start 1;

-- ============================================================
-- 10. SEED: 62 ROOMS across 6 floors
-- ============================================================
-- Floor 1: Rooms 101–107 | Rate ₹1800 | Standard AC
insert into hms_rooms (room_number, room_type, floor, base_rate, status) values
  ('101','Standard AC',1,1800,'Vacant Clean'),
  ('102','Standard AC',1,1800,'Vacant Clean'),
  ('103','Standard AC',1,1800,'Vacant Clean'),
  ('104','Standard AC',1,1800,'Vacant Clean'),
  ('105','Standard AC',1,1800,'Vacant Clean'),
  ('106','Standard AC',1,1800,'Vacant Clean'),
  ('107','Standard AC',1,1800,'Vacant Clean')
on conflict (room_number) do nothing;

-- Floor 2: Rooms 201–211 | Rate ₹2200 | Deluxe AC
insert into hms_rooms (room_number, room_type, floor, base_rate, status) values
  ('201','Deluxe AC',2,2200,'Vacant Clean'),
  ('202','Deluxe AC',2,2200,'Vacant Clean'),
  ('203','Deluxe AC',2,2200,'Vacant Clean'),
  ('204','Deluxe AC',2,2200,'Vacant Clean'),
  ('205','Deluxe AC',2,2200,'Vacant Clean'),
  ('206','Deluxe AC',2,2200,'Vacant Clean'),
  ('207','Deluxe AC',2,2200,'Vacant Clean'),
  ('208','Deluxe AC',2,2200,'Vacant Clean'),
  ('209','Deluxe AC',2,2200,'Vacant Clean'),
  ('210','Deluxe AC',2,2200,'Vacant Clean'),
  ('211','Deluxe AC',2,2200,'Vacant Clean')
on conflict (room_number) do nothing;

-- Floor 3: Rooms 301–311 | Rate ₹2200 | Deluxe AC
insert into hms_rooms (room_number, room_type, floor, base_rate, status) values
  ('301','Deluxe AC',3,2200,'Vacant Clean'),
  ('302','Deluxe AC',3,2200,'Vacant Clean'),
  ('303','Deluxe AC',3,2200,'Vacant Clean'),
  ('304','Deluxe AC',3,2200,'Vacant Clean'),
  ('305','Deluxe AC',3,2200,'Vacant Clean'),
  ('306','Deluxe AC',3,2200,'Vacant Clean'),
  ('307','Deluxe AC',3,2200,'Vacant Clean'),
  ('308','Deluxe AC',3,2200,'Vacant Clean'),
  ('309','Deluxe AC',3,2200,'Vacant Clean'),
  ('310','Deluxe AC',3,2200,'Vacant Clean'),
  ('311','Deluxe AC',3,2200,'Vacant Clean')
on conflict (room_number) do nothing;

-- Floor 4: Rooms 401–411 | Rate ₹2500 | Premium AC
insert into hms_rooms (room_number, room_type, floor, base_rate, status) values
  ('401','Premium AC',4,2500,'Vacant Clean'),
  ('402','Premium AC',4,2500,'Vacant Clean'),
  ('403','Premium AC',4,2500,'Vacant Clean'),
  ('404','Premium AC',4,2500,'Vacant Clean'),
  ('405','Premium AC',4,2500,'Vacant Clean'),
  ('406','Premium AC',4,2500,'Vacant Clean'),
  ('407','Premium AC',4,2500,'Vacant Clean'),
  ('408','Premium AC',4,2500,'Vacant Clean'),
  ('409','Premium AC',4,2500,'Vacant Clean'),
  ('410','Premium AC',4,2500,'Vacant Clean'),
  ('411','Premium AC',4,2500,'Vacant Clean')
on conflict (room_number) do nothing;

-- Floor 5: Rooms 501–511 | Rate ₹2500 | Premium AC
insert into hms_rooms (room_number, room_type, floor, base_rate, status) values
  ('501','Premium AC',5,2500,'Vacant Clean'),
  ('502','Premium AC',5,2500,'Vacant Clean'),
  ('503','Premium AC',5,2500,'Vacant Clean'),
  ('504','Premium AC',5,2500,'Vacant Clean'),
  ('505','Premium AC',5,2500,'Vacant Clean'),
  ('506','Premium AC',5,2500,'Vacant Clean'),
  ('507','Premium AC',5,2500,'Vacant Clean'),
  ('508','Premium AC',5,2500,'Vacant Clean'),
  ('509','Premium AC',5,2500,'Vacant Clean'),
  ('510','Premium AC',5,2500,'Vacant Clean'),
  ('511','Premium AC',5,2500,'Vacant Clean')
on conflict (room_number) do nothing;

-- Floor 6: Rooms 601–611 | Rate ₹3000 | Suite AC
insert into hms_rooms (room_number, room_type, floor, base_rate, status) values
  ('601','Suite AC',6,3000,'Vacant Clean'),
  ('602','Suite AC',6,3000,'Vacant Clean'),
  ('603','Suite AC',6,3000,'Vacant Clean'),
  ('604','Suite AC',6,3000,'Vacant Clean'),
  ('605','Suite AC',6,3000,'Vacant Clean'),
  ('606','Suite AC',6,3000,'Vacant Clean'),
  ('607','Suite AC',6,3000,'Vacant Clean'),
  ('608','Suite AC',6,3000,'Vacant Clean'),
  ('609','Suite AC',6,3000,'Vacant Clean'),
  ('610','Suite AC',6,3000,'Vacant Clean'),
  ('611','Suite AC',6,3000,'Vacant Clean')
on conflict (room_number) do nothing;

-- ============================================================
-- 11. SEED: DEFAULT STAFF ACCOUNTS
-- Passwords stored as plain text for MVP (same as TP system)
-- Change these immediately after first login!
-- ============================================================
insert into hms_staff (username, password_hash, name, role) values
  ('owner',      'Owner@Srimuni2026',    'Hotel Owner',   'OWNER'),
  ('manager',    'Manager@Srimuni2026',  'Front Desk Manager', 'MANAGER'),
  ('housekeep1', 'House@Srimuni2026',    'Housekeeping Staff', 'HOUSEKEEPING')
on conflict (username) do nothing;

-- ============================================================
-- 12. ROW LEVEL SECURITY — all access via service role only
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
-- DONE. Verify with:
-- select table_name from information_schema.tables
--   where table_schema = 'public' and table_name like 'hms_%'
--   order by table_name;
-- ============================================================

-- ============================================================
-- SEED DATA — Default Staff Accounts
-- Run once. Passwords are plain text for MVP.
-- ============================================================
insert into hms_staff (username, password_hash, name, role) values
  ('owner',        'Owner@Srimuni2026',   'Hotel Owner',        'OWNER'),
  ('manager',      'Manager@Srimuni2026', 'Front Desk Manager', 'MANAGER'),
  ('housekeep1',   'House@Srimuni2026',   'Housekeeping Staff', 'HOUSEKEEPING')
on conflict (username) do nothing;

-- ============================================================
-- SEED DATA — 62 Rooms across 6 Floors
--
-- Floor 1  : Rooms 101–110  Non-AC Standard  ₹900
-- Floor 2  : Rooms 201–210  Non-AC Standard  ₹900
-- Floor 3  : Rooms 301–310  Non-AC Standard  ₹900
-- Floor 4  : Rooms 401–412  AC Standard      ₹1400
-- Floor 5  : Rooms 501–512  AC Standard      ₹1400
-- Floor 6  : Rooms 601–608  Deluxe AC        ₹2000
-- ============================================================
insert into hms_rooms (room_number, room_type, floor, base_rate, status) values
  -- Floor 1 Non-AC
  ('101', 'Non-AC', 1, 900,  'Vacant Clean'),
  ('102', 'Non-AC', 1, 900,  'Vacant Clean'),
  ('103', 'Non-AC', 1, 900,  'Vacant Clean'),
  ('104', 'Non-AC', 1, 900,  'Vacant Clean'),
  ('105', 'Non-AC', 1, 900,  'Vacant Clean'),
  ('106', 'Non-AC', 1, 900,  'Vacant Clean'),
  ('107', 'Non-AC', 1, 900,  'Vacant Clean'),
  ('108', 'Non-AC', 1, 900,  'Vacant Clean'),
  ('109', 'Non-AC', 1, 900,  'Vacant Clean'),
  ('110', 'Non-AC', 1, 900,  'Vacant Clean'),
  -- Floor 2 Non-AC
  ('201', 'Non-AC', 2, 900,  'Vacant Clean'),
  ('202', 'Non-AC', 2, 900,  'Vacant Clean'),
  ('203', 'Non-AC', 2, 900,  'Vacant Clean'),
  ('204', 'Non-AC', 2, 900,  'Vacant Clean'),
  ('205', 'Non-AC', 2, 900,  'Vacant Clean'),
  ('206', 'Non-AC', 2, 900,  'Vacant Clean'),
  ('207', 'Non-AC', 2, 900,  'Vacant Clean'),
  ('208', 'Non-AC', 2, 900,  'Vacant Clean'),
  ('209', 'Non-AC', 2, 900,  'Vacant Clean'),
  ('210', 'Non-AC', 2, 900,  'Vacant Clean'),
  -- Floor 3 Non-AC
  ('301', 'Non-AC', 3, 900,  'Vacant Clean'),
  ('302', 'Non-AC', 3, 900,  'Vacant Clean'),
  ('303', 'Non-AC', 3, 900,  'Vacant Clean'),
  ('304', 'Non-AC', 3, 900,  'Vacant Clean'),
  ('305', 'Non-AC', 3, 900,  'Vacant Clean'),
  ('306', 'Non-AC', 3, 900,  'Vacant Clean'),
  ('307', 'Non-AC', 3, 900,  'Vacant Clean'),
  ('308', 'Non-AC', 3, 900,  'Vacant Clean'),
  ('309', 'Non-AC', 3, 900,  'Vacant Clean'),
  ('310', 'Non-AC', 3, 900,  'Vacant Clean'),
  -- Floor 4 AC
  ('401', 'AC', 4, 1400, 'Vacant Clean'),
  ('402', 'AC', 4, 1400, 'Vacant Clean'),
  ('403', 'AC', 4, 1400, 'Vacant Clean'),
  ('404', 'AC', 4, 1400, 'Vacant Clean'),
  ('405', 'AC', 4, 1400, 'Vacant Clean'),
  ('406', 'AC', 4, 1400, 'Vacant Clean'),
  ('407', 'AC', 4, 1400, 'Vacant Clean'),
  ('408', 'AC', 4, 1400, 'Vacant Clean'),
  ('409', 'AC', 4, 1400, 'Vacant Clean'),
  ('410', 'AC', 4, 1400, 'Vacant Clean'),
  ('411', 'AC', 4, 1400, 'Vacant Clean'),
  ('412', 'AC', 4, 1400, 'Vacant Clean'),
  -- Floor 5 AC
  ('501', 'AC', 5, 1400, 'Vacant Clean'),
  ('502', 'AC', 5, 1400, 'Vacant Clean'),
  ('503', 'AC', 5, 1400, 'Vacant Clean'),
  ('504', 'AC', 5, 1400, 'Vacant Clean'),
  ('505', 'AC', 5, 1400, 'Vacant Clean'),
  ('506', 'AC', 5, 1400, 'Vacant Clean'),
  ('507', 'AC', 5, 1400, 'Vacant Clean'),
  ('508', 'AC', 5, 1400, 'Vacant Clean'),
  ('509', 'AC', 5, 1400, 'Vacant Clean'),
  ('510', 'AC', 5, 1400, 'Vacant Clean'),
  ('511', 'AC', 5, 1400, 'Vacant Clean'),
  ('512', 'AC', 5, 1400, 'Vacant Clean'),
  -- Floor 6 Deluxe AC
  ('601', 'Deluxe AC', 6, 2000, 'Vacant Clean'),
  ('602', 'Deluxe AC', 6, 2000, 'Vacant Clean'),
  ('603', 'Deluxe AC', 6, 2000, 'Vacant Clean'),
  ('604', 'Deluxe AC', 6, 2000, 'Vacant Clean'),
  ('605', 'Deluxe AC', 6, 2000, 'Vacant Clean'),
  ('606', 'Deluxe AC', 6, 2000, 'Vacant Clean'),
  ('607', 'Deluxe AC', 6, 2000, 'Vacant Clean'),
  ('608', 'Deluxe AC', 6, 2000, 'Vacant Clean')
on conflict (room_number) do nothing;
