-- ============================================================
-- Srimuni Hotels — Travel Partner Tool — Supabase Migration
-- Run this entire script in Supabase SQL Editor (once)
-- ============================================================

-- Table 1: travel_partners
create table if not exists travel_partners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  phone_number text not null,
  vehicle_number text not null,

  driver_name text,
  vehicle_make text,
  lead_source text default 'Vehicle Number Seen',
  partner_status text default 'Lead Only',

  is_active boolean default true,
  last_contacted_at timestamp with time zone,

  notes text,
  created_by text
);

-- Indexes for travel_partners
create index if not exists idx_travel_partners_phone
  on travel_partners(phone_number);

create index if not exists idx_travel_partners_vehicle
  on travel_partners(vehicle_number);

create unique index if not exists unique_partner_phone_vehicle
  on travel_partners(phone_number, vehicle_number);

-- Auto-update updated_at on row change
create or replace function update_travel_partner_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_travel_partners_updated_at on travel_partners;
create trigger trg_travel_partners_updated_at
  before update on travel_partners
  for each row execute procedure update_travel_partner_updated_at();

-- ============================================================

-- Table 2: commission_entries
create table if not exists commission_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),

  partner_id uuid references travel_partners(id) on delete cascade,

  customer_name text,
  room_number text,
  booking_amount numeric default 0,
  commission_amount numeric not null,

  commission_status text default 'Pending',
  payment_mode text default 'Pending',

  paid_at timestamp with time zone,
  notes text,
  entered_by text
);

-- Indexes for commission_entries
create index if not exists idx_commission_partner
  on commission_entries(partner_id);

create index if not exists idx_commission_status
  on commission_entries(commission_status);

create index if not exists idx_commission_created_at
  on commission_entries(created_at);

-- ============================================================

-- Table 3: followup_logs
create table if not exists followup_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),

  partner_id uuid references travel_partners(id) on delete cascade,

  contact_method text,
  response_status text,
  next_followup_at timestamp with time zone,
  notes text,
  entered_by text
);

create index if not exists idx_followup_partner
  on followup_logs(partner_id);

create index if not exists idx_followup_created_at
  on followup_logs(created_at);

-- ============================================================
-- Done! Verify with:
-- select table_name from information_schema.tables where table_schema = 'public';
-- ============================================================

-- ============================================================
-- IMPORTANT: Disable Row Level Security (RLS)
-- Run this IMMEDIATELY after creating the tables if inserts fail.
-- By default Supabase enables RLS on all new tables, which blocks
-- the anon API key from inserting rows.
-- ============================================================

alter table travel_partners disable row level security;
alter table commission_entries disable row level security;
alter table followup_logs disable row level security;

-- ============================================================
-- OR: If you prefer to keep RLS enabled, use these policies instead:
-- ============================================================

-- CREATE POLICY "Allow all operations" ON travel_partners FOR ALL TO anon USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON commission_entries FOR ALL TO anon USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON followup_logs FOR ALL TO anon USING (true) WITH CHECK (true);
